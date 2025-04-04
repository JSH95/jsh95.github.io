import holidayListData from "../utils/holidayListData";
import createAxiosInstance from "../config/api";
const calculateWorkHours = async (year, month, role, username) => {

    const timeStringToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
    };

    const GetBusinessDays = (year, month, holidays) => {
        let businessDays = 0;
        const date = new Date(year, month - 1, 1);
        while (date.getMonth() === month - 1) {
            const day = date.getDay();
            const formattedDate = date.toISOString().slice(0, 10); // YYYY-MM-DD 형식
            if (day !== 0 && day !== 6 && !holidays.includes(formattedDate)) {
                businessDays++;
            }
            date.setDate(date.getDate() + 1);
        }
        return businessDays;
    };

    try {
        const axiosInstance = createAxiosInstance();
        let ID;
        if(!username){
            ID = username;
        } else {
            ID = username;
        }

        const response = await axiosInstance.get(`/workSchedule/${ID}/${year}/${month}`);
        // let role = localStorage.getItem("role");
        // let username = localStorage.getItem("username");
        const filteredData = response.data
            // .filter(
        //     (entry) =>
        //         (entry.workType === '출근' || entry.workType === '휴일출근')
        //         // &&
        //         // ((role === 'ROLE_ADMIN' ||role === 'ROLE_TEAM_LEADER')|| entry.employee.team.teamLeaderId === username) // 어드민이면 팀장 ID 조건 제거
        // );
        const japanHolidaysObject = await holidayListData();
        const japanHolidays = Object.keys(japanHolidaysObject);
        const businessDaysInMonth = GetBusinessDays(year, month, japanHolidays);

        const employeeHours = {};
        const basicWorkTime = {};
        const usernames = {};

        filteredData.forEach((entry) => {
            const { id } = entry.employee;
            const checkIn = new Date(`${entry.checkInDate}T${entry.checkInTime}`);
            const checkOut = new Date(`${entry.checkOutDate}T${entry.checkOutTime}`);
            const breakStart = new Date(`${entry.checkInDate}T${entry.breakTimeIn}`);
            const breakEnd = new Date(`${entry.checkInDate}T${entry.breakTimeOut}`);

            // 기본 근무시간 계산
            const BasicCheckInMinutes = timeStringToMinutes(entry.employeeWorkDate?.checkInTime);
            const BasicCheckOutMinutes = timeStringToMinutes(entry.employeeWorkDate?.checkOutTime);
            const BasicBreakInMinutes = timeStringToMinutes(entry.employeeWorkDate?.breakTimeIn);
            const BasicBreakOutMinutes = timeStringToMinutes(entry.employeeWorkDate?.breakTimeOut);
            const basicWorkTimeInHours = ((BasicCheckOutMinutes - BasicCheckInMinutes - (BasicBreakOutMinutes - BasicBreakInMinutes)) / 60).toFixed(1);
            const monthlyBasicWorkTime = (basicWorkTimeInHours * businessDaysInMonth).toFixed(0);

            // 실제 근무 시간 계산
            const workDuration = (checkOut - checkIn - (breakEnd - breakStart)) > 0
                ? Math.floor((checkOut - checkIn - (breakEnd - breakStart)) / (1000 * 60 * 60))
                : 0;

            employeeHours[id] = (employeeHours[id] || 0) + Number(workDuration);
            basicWorkTime[id] = monthlyBasicWorkTime;
            usernames[id] =  entry.employee.name;
        });
        return Object.keys(employeeHours).map((id) => ({
            id,
            username: usernames[id],
            hours: employeeHours[id],
            basicWorkTime: basicWorkTime[id],
        }));
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};
export default calculateWorkHours;
