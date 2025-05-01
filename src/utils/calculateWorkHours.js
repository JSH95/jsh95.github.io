import holidayListData from "../utils/holidayListData";
import createAxiosInstance from "../config/api";
import {useAuth} from "../config/AuthContext";

const timeStringToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
};

const getBusinessDays = (year, month, holidays) => {
    let businessDays = 0;
    const date = new Date(year, month - 1, 1);
    while (date.getMonth() === month - 1) {
        const day = date.getDay();
        const formattedDate = date.toISOString().slice(0, 10);
        if (day !== 0 && day !== 6 && !holidays.includes(formattedDate)) {
            businessDays++;
        }
        date.setDate(date.getDate() + 1);
    }
    return businessDays;
};

export const calculateWorkStats = async (year, month, username, role, run) => {
    try {
        const axiosInstance = createAxiosInstance();
        const endpoint = run === 0
            ? `/workSchedule/${username}/${year}/${month}`
            : `/workSchedule/${year}/${month}`;

        const response = await axiosInstance.get(endpoint);
        // console.log("계산", endpoint);
        const dataArray = response.data
            ? (Array.isArray(response.data) ? response.data : [response.data])
            : [];

        const japanHolidaysObject = await holidayListData();
        const japanHolidays = Object.keys(japanHolidaysObject).filter((dateStr) => {
            const date = new Date(dateStr);
            return date.getFullYear() === year && date.getMonth() + 1 === month;
        });
        const businessDaysInMonth = getBusinessDays(year, month, japanHolidays);

        const groupedByEmployee = {};
        const filteredData = username
            ? dataArray.filter(entry => {
                if (role === 'ROLE_ADMIN' || role === 'ROLE_TEAM_LEADER') {
                    return true;
                } else if (role === 'ROLE_TEAM') {
                    return entry.employee.team.teamLeaderId === username;
                }
                return false;
            })
            : dataArray;
        // console.log("필터링된 데이터", filteredData);
        filteredData.forEach((entry) => {
            const id = entry.employee.id;
            if (!groupedByEmployee[id]) {
                groupedByEmployee[id] = {
                    employee: entry.employee,
                    records: [],
                };
            }
            groupedByEmployee[id].records.push(entry);
            // console.log("전체", groupedByEmployee[id].records);
        });

        const allowedTypes = ["出勤", "休日出勤", "有給休暇"];
        const results = [];
        Object.values(groupedByEmployee).forEach(({ employee, records }) => {

            let totalWorkHours = 0, lateCount = 0, nightShiftHours = 0;
            let absences = 0, substituteHolidays = 0, paidLeave = 0;
            let dayOff = 0, specialLeave = 0, condolenceLeave = 0;
            let holidayWork = 0, headOfficeAttendance = 0;
            let statutoryOvertime = 0; // 법정시간 외 근무시간
            let withinScheduledHours = 0; // 소정 내 근무시간
            let overScheduledHours = 0; // 소정 초과 근무시간
            let holidayWorkLegal = 0; // 법정 휴일 근무시간
            let holidayWorkNonLegal = 0; // 법정 외 휴일 근무
            let midnightWork = 0; // 자정 근무
            let totalBreakTime = 0; // 휴게시간 총합
            // console.log("▶ 전체 workPosition 목록:", records.map(r => r.workType));
            records
                .filter(r =>
                    allowedTypes.includes(r.workType) &&
                    r.workPosition !== "休暇"
                )
                .forEach((r) => {
                const checkIn = new Date(`${r.checkInDate}T${r.checkInTime}`);
                const checkOut = new Date(`${r.checkOutDate || r.checkInDate}T${r.checkOutTime}`);
                const breakTime =  (r.breakTime || 0) * 60 * 1000;

                const workDuration = (checkOut - checkIn - breakTime) / 3600000;
                const realWorkTime = Math.max(workDuration, 0);
                totalWorkHours += realWorkTime;

                if (
                    (r.checkInDate === r.checkOutDate) &&
                    r.checkInTime > r.employeeWorkDate?.checkInTime &&
                    !r.employeeWorkDate?.flexTime
                ) lateCount++;

                if (checkOut.getHours() >= 22) {
                    const overtimeMinutes = (checkOut.getHours() - 22) * 60 + checkOut.getMinutes();
                    nightShiftHours += Math.floor(overtimeMinutes / 60);
                }

                switch (r.workType) {
                    case "欠勤": absences++; break;
                    case "代休": substituteHolidays++; break;
                    case "有給休暇": paidLeave++; break;
                    case "特別休暇": specialLeave++; break;
                    case "休日代替": dayOff++; break;
                    case "慶弔休暇": condolenceLeave++; break;
                    case "休日出勤": holidayWork++; break;
                    default: break;
                }

                if (r.workPosition === "本社") headOfficeAttendance++;

                    const isHoliday = japanHolidays.includes(r.checkInDate) || [0, 6].includes(new Date(r.checkInDate).getDay());
                    totalBreakTime += (r.breakTime || 0);

                    const checkInHour = checkIn.getHours() + checkIn.getMinutes() / 60;
                    const checkOutHour = checkOut.getHours() + checkOut.getMinutes() / 60;

                    if (!isHoliday) {
                        const start = Math.max(checkInHour, 9);
                        const end = Math.min(checkOutHour, 18);
                        withinScheduledHours += Math.max(end - start, 0);

                        if (checkOutHour > 18) {
                            overScheduledHours += checkOutHour - 18;
                        }
                    } else {
                        holidayWorkNonLegal += realWorkTime;
                    }

                    if (new Date(r.checkInDate).getDay() === 0) {
                        holidayWorkLegal += realWorkTime;
                    }

                    if (checkOutHour >= 22) {
                        midnightWork += checkOutHour - 22;
                    }

                    if (realWorkTime > 8) {
                        statutoryOvertime += realWorkTime - 8;
                    }
            });
            const monthlyBasicWorkTime = (8 * businessDaysInMonth).toFixed(0);

            const checkStates = records.map(r => r.workScheduleState).filter(Boolean);
            const getWorkScheduleStatus = (checkStates) => {
                if (!checkStates || checkStates.length === 0) return "未提出";
                if (checkStates.includes("修正依頼") || checkStates.includes("再修正依頼")) {
                    return "修正依頼";
                } else if (checkStates.includes("再提出") || checkStates.includes("再再提出")) {
                    return "再提出";
                } else if (checkStates.includes("申請中")) {
                    return "申請中";
                } else if (checkStates.includes("確認完了")) {
                    return "確認完了";
                } else if (checkStates.includes("承認完了")) {
                    return "承認完了";
                } else if (checkStates.includes("最終確認完了")) {
                    return "最終確認完了";
                } else {
                    return "未提出";
                }
            };

            results.push({
                employeeId: employee.id,
                employeeName: employee.name,
                totalWorkDays: records.length,
                totalWorkHours: Number(totalWorkHours.toFixed(1)),
                basicWorkHours:  Number(monthlyBasicWorkTime),
                status: getWorkScheduleStatus(checkStates), // 변경된 부분
                actualWorkHours: Number(totalWorkHours.toFixed(1)), // 실업시간
                withinScheduledHours: Number(withinScheduledHours.toFixed(1)), // 소정내
                overScheduledHours: Number(overScheduledHours.toFixed(1)), // 잔업
                statutoryOvertime: Number(statutoryOvertime.toFixed(1)), // 법정초과
                holidayWorkLegal: Number(holidayWorkLegal.toFixed(1)),
                holidayWorkNonLegal: Number(holidayWorkNonLegal.toFixed(1)),
                midnightWork: Number(midnightWork.toFixed(1)),
                paidLeaveUsed: paidLeave,
                substituteHolidayUsed: substituteHolidays,
                holidaysThisMonth: japanHolidays.length,
                lateCount,
                nightShiftHours,
                absences,
                substituteHolidays,
                paidLeave,
                dayOff,
                specialLeave,
                condolenceLeave,
                holidayWork,
                headOfficeAttendance,

            });
        });

        return results;

    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};
