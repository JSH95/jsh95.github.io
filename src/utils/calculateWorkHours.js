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

export const calculateWorkStats = async (year, month, username, role = 'ROLE_USER') => {
    try {
        const axiosInstance = createAxiosInstance();
        const endpoint = username
            ? `/workSchedule/${username}/${year}/${month}`
            : `/workSchedule/${year}/${month}`;

        const response = await axiosInstance.get(endpoint);
        const dataArray = response.data
            ? (Array.isArray(response.data) ? response.data : [response.data])
            : [];

        const japanHolidaysObject = await holidayListData();
        const japanHolidays = Object.keys(japanHolidaysObject);
        const businessDaysInMonth = getBusinessDays(year, month, japanHolidays);

        const groupedByEmployee = {};

        const filteredData = !username
            ? dataArray.filter(entry => {
                if (role === 'ROLE_ADMIN' || role === 'ROLE_TEAM_LEADER') {
                    return true;
                } else if (role === 'ROLE_TEAM') {
                    return entry.employee?.team?.teamLeaderId === username;
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

        const results = [];

        Object.values(groupedByEmployee).forEach(({ employee, records }) => {
            let totalWorkHours = 0, lateCount = 0, nightShiftHours = 0;
            let absences = 0, substituteHolidays = 0, paidLeave = 0;
            let dayOff = 0, specialLeave = 0, condolenceLeave = 0;
            let holidayWork = 0, headOfficeAttendance = 0;

            records.forEach((r) => {
                const checkIn = new Date(`${r.checkInDate}T${r.checkInTime}`);
                const checkOut = new Date(`${r.checkOutDate || r.checkInDate}T${r.checkOutTime}`);
                const breakTime = r.breakTime || 0;

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
                    case "결근": absences++; break;
                    case "유급휴가": paidLeave++; break;
                    case "대휴": substituteHolidays++; break;
                    case "특별휴가": specialLeave++; break;
                    case "휴일대체": dayOff++; break;
                    case "경조휴가": condolenceLeave++; break;
                    case "휴일출근": holidayWork++; break;
                    default: break;
                }

                if (r.workPosition === "본사") headOfficeAttendance++;
            });
            // console.log("직원", records[0]);
            // const basicCheckInMinutes = timeStringToMinutes(records[0].employeeWorkDate?.checkInTime);
            // const basicCheckOutMinutes = timeStringToMinutes(records[0].employeeWorkDate?.checkOutTime);
            // const basicBreak = records[0].employeeWorkDate?.breakTime || 0;
            // const basicWorkTimeInHours = ((basicCheckOutMinutes - basicCheckInMinutes - basicBreak) / 60).toFixed(1);
            const monthlyBasicWorkTime = (8 * businessDaysInMonth).toFixed(0);

            results.push({
                employeeId: employee.id,
                employeeName: employee.name,
                totalWorkDays: records.length,
                totalWorkHours: Number(totalWorkHours.toFixed(1)),
                basicWorkHours:  Number(monthlyBasicWorkTime),
                status : records[0].workScheduleState,
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
