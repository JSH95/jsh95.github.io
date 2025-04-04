export function calculateStatsForAllEmployees(data, year, month) {

    // const thisMonthRecords = data
    //     .filter((r) => {
    //     const date = new Date(r.checkInDate);
    //     return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    // });
    const groupedByEmployee = {};

    data.forEach((r) => {
        const employeeId = r.employee.id;
        if (!groupedByEmployee[employeeId]) {
            groupedByEmployee[employeeId] = {
                employee: r.employee,
                records: [],
            };
        }
        groupedByEmployee[employeeId].records.push(r);
    });
    const results = [];

    Object.values(groupedByEmployee).forEach(({ employee, records }) => {
        let totalWorkHours = 0;
        let lateCount = 0;
        let nightShiftHours = 0;
        let absences = 0;
        let substituteHolidays = 0;
        let paidLeave = 0;
        let dayOff = 0;
        let specialLeave = 0;
        let condolenceLeave = 0;
        let holidayWork = 0;
        let headOfficeAttendance = 0;
        // let totalCommuteCost = 0;
        // let totalReimbursement = 0;

        records.forEach((r) => {
        const checkIn = new Date(`${r.checkInDate}T${r.checkInTime}`);
        const checkOut = new Date(`${r.checkOutDate || r.checkInDate}T${r.checkOutTime}`);
        const breakStart = new Date(`${r.checkInDate}T${r.breakTimeIn}`);
        const breakEnd = new Date(`${r.checkInDate}T${r.breakTimeOut}`);
        const workDuration = (checkOut - checkIn) / 3600000;
        const breakDuration = (breakEnd - breakStart) / 3600000;
        const realWorkTime = Math.max(workDuration - breakDuration, 0);
        totalWorkHours += realWorkTime;

        if ((r.checkInDate === r.checkOutDate) &&
            r.checkInTime > r.employeeWorkDate?.checkInTime &&
            !r.employeeWorkDate?.flexTime) lateCount++;

        if (checkOut.getHours() >= 22) {
            const overtimeMinutes = (checkOut.getHours() - 22) * 60 + checkOut.getMinutes();
            const overtimeHours = Math.floor(overtimeMinutes / 60); // 야근 시간을 시간 단위로 변환
            nightShiftHours += overtimeHours;
        }

            switch (r.workType) {
                case "결근":
                    absences++;
                    break;
                case "유급휴가":
                    paidLeave++;
                    break;
                case "대휴":
                    substituteHolidays++;
                    break;
                case "특별휴가":
                    specialLeave++;
                    break;
                case "휴일대체":
                    dayOff++;
                    break;
                case "경조휴가":
                    condolenceLeave++;
                    break;
                case "휴일출근":
                    holidayWork++;
                    break;
                // 출근은 따로 안 셈
                default:
                    break;
            }

        if (r.workPosition === "HEAD_OFFICE") headOfficeAttendance++;

        // totalCommuteCost += r.commuteCost || 0;
        // totalReimbursement += r.reimbursement || 0;
    });

        results.push({
            employee,
            totalWorkDays: records.length,
            totalWorkHours: totalWorkHours.toFixed(1),
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
            // totalCommuteCost,
            // totalReimbursement,
        });
    });
    return results;
}
