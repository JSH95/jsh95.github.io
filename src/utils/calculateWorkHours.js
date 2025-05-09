import holidayListData from "../utils/holidayListData";
import createAxiosInstance from "../config/api";

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

        filteredData.forEach((entry) => {
            const id = entry.employee.id;
            if (!groupedByEmployee[id]) {
                groupedByEmployee[id] = {
                    employee: entry.employee,
                    records: [],
                };
            }
            groupedByEmployee[id].records.push(entry);
        });

        const results = [];

        Object.values(groupedByEmployee).forEach(({ employee, records }) => {
            let totalWorkHours = 0, lateCount = 0, nightShiftHours = 0;
            let absences = 0, substituteHolidays = 0, paidLeave = 0;
            let dayOff = 0, specialLeave = 0, condolenceLeave = 0;
            let holidayWork = 0, headOfficeAttendance = 0;
            let statutoryOvertime = 0;
            let withinScheduledHours = 0;
            let overScheduledHours = 0;
            let holidayWorkLegal = 0;
            let holidayWorkNonLegal = 0;
            let midnightWork = 0;
            let totalBreakTime = 0;

            let earlyLeaveCount = 0;
            let lateMinutes = 0;
            let earlyLeaveMinutes = 0;

            const standardCheckInMinutes = 9 * 60;
            const standardCheckOutMinutes = 18 * 60;

            const halfDayPositions = ["本社", "現場", "在宅"];

            const workRecords = records.filter(r => {
                // 1) 출근/휴일출근
                if (r.workType === "出勤" || r.workType === "休日出勤") {
                    return true;
                }
                // 2) 유급휴가 중 반휴만
                if (r.workType === "有給休暇") {
                    return halfDayPositions.includes(r.workPosition);
                }
                // 그 외는 제외
                return false;
            });
            console.log("필터", workRecords)
            records.forEach((r)=> {
                switch (r.workType) {
                    case "欠勤": absences++; break;
                    case "代休": substituteHolidays++; break;
                    case "有給休暇": paidLeave++; break;
                    case "特別休暇": specialLeave++; break;
                    case "休日代替": dayOff++; break;
                    case "慶弔休暇": condolenceLeave++; break;
                    case "休日出勤": holidayWork++; break;
                }
            })
            workRecords
                .forEach((r) => {
                    const checkIn = new Date(`${r.checkInDate}T${r.checkInTime}`);
                    const checkOut = new Date(`${r.checkOutDate || r.checkInDate}T${r.checkOutTime}`);
                    const breakTime = (r.breakTime || 0) * 60 * 1000;

                    const workDuration = (checkOut - checkIn - breakTime) / 3600000;
                    const realWorkTime = Math.max(workDuration, 0);
                    totalWorkHours += realWorkTime;

                    const checkInMinutes = timeStringToMinutes(r.checkInTime);
                    const checkOutMinutes = timeStringToMinutes(r.checkOutTime);

                    if (checkInMinutes > standardCheckInMinutes) {
                        lateMinutes += checkInMinutes - standardCheckInMinutes;
                        lateCount++;
                    }

                    if (checkOutMinutes < standardCheckOutMinutes) {
                        earlyLeaveCount++;
                        earlyLeaveMinutes += standardCheckOutMinutes - checkOutMinutes;
                    }

                    if (checkOut.getHours() >= 22) {
                        const overtimeMinutes = (checkOut.getHours() - 22) * 60 + checkOut.getMinutes();
                        nightShiftHours += Math.floor(overtimeMinutes / 60);
                    }

                    // switch (r.workType) {
                    //     case "欠勤": absences++; break;
                    //     case "代休": substituteHolidays++; break;
                    //     case "有給休暇": paidLeave++; break;
                    //     case "特別休暇": specialLeave++; break;
                    //     case "休日代替": dayOff++; break;
                    //     case "慶弔休暇": condolenceLeave++; break;
                    //     case "休日出勤": holidayWork++; break;
                    // }

                    if (r.workPosition === "本社") headOfficeAttendance++;

                    const isHoliday = japanHolidays.includes(r.checkInDate) || [0, 6].includes(new Date(r.checkInDate).getDay());
                    totalBreakTime += (r.breakTime || 0);

                    const checkInHour = checkIn.getHours() + checkIn.getMinutes() / 60;
                    const checkOutHour = checkOut.getHours() + checkOut.getMinutes() / 60;
                    const scheduledHours = Math.max(Math.min(checkOutHour, 18) - Math.max(checkInHour, 9), 0);

                    if (!isHoliday) {
                        withinScheduledHours += scheduledHours;
                        const over = realWorkTime - scheduledHours;
                        overScheduledHours += Math.max(0, over);

                        const legal = realWorkTime - 8;
                        statutoryOvertime += Math.max(0, legal);
                    } else {
                        holidayWorkNonLegal += realWorkTime;
                    }

                    if (new Date(r.checkInDate).getDay() === 0) {
                        holidayWorkLegal += realWorkTime;
                    }

                    if (checkOutHour >= 22) {
                        midnightWork += checkOutHour - 22;
                    }
                });
            const monthlyBasicWorkTime = businessDaysInMonth * 8;
            const deficitScheduledHours = Math.max(0, monthlyBasicWorkTime - withinScheduledHours);

            const checkStates = workRecords.map(r => r.workScheduleState).filter(Boolean);
            const getWorkScheduleStatus = (checkStates) => {
                if (!checkStates || checkStates.length === 0) return "未提出";
                if (checkStates.includes("修正依頼") || checkStates.includes("再修正依頼")) return "修正依頼";
                if (checkStates.includes("再提出") || checkStates.includes("再再提出")) return "再提出";
                if (checkStates.includes("申請中")) return "申請中";
                if (checkStates.includes("確認完了")) return "確認完了";
                if (checkStates.includes("承認完了")) return "承認完了";
                if (checkStates.includes("最終確認完了")) return "最終確認完了";
                return "未提出";
            };

            results.push({
                employeeId: employee.id,
                employeeName: employee.name,
                scheduledWorkDays: businessDaysInMonth,
                totalWorkDays: workRecords.length,
                totalWorkHours: Number(totalWorkHours.toFixed(1)),
                basicWorkHours: Number(monthlyBasicWorkTime),
                status: getWorkScheduleStatus(checkStates),
                actualWorkHours: Number(totalWorkHours.toFixed(1)),
                withinScheduledHours: Number(withinScheduledHours.toFixed(1)),
                overScheduledHours: Number(overScheduledHours.toFixed(1)),
                statutoryOvertime: Number(statutoryOvertime.toFixed(1)),
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
                earlyLeaveCount,
                lateMinutes: Math.floor(lateMinutes),
                earlyLeaveMinutes: Math.floor(earlyLeaveMinutes),
                deficitScheduledHours: Number(deficitScheduledHours.toFixed(1)),
            });
        });

        return results;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};
