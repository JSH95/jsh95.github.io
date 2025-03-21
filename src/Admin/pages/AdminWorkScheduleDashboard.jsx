import React, { useEffect, useState } from "react";
import {BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell} from "recharts";
import "../../config/index.css";
import createAxiosInstance from "../../config/api";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../config/AuthContext";
import holidayListData from "../../utils/holidayListData";


const AdminWorkScheduleDashboard = () => {
    const { username } = useAuth();
    const { role } = useAuth();
    const navigate = useNavigate();
    const [chartData, setChartData] = useState([]);
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    // console.log("chartData",chartData);
    const timeStringToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    function GetBusinessDays(year, month, holidays) {
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
        console.log("businessDays",businessDays)
        return businessDays;
    }

    useEffect(() => {
        const fetchData = async () => {

            try {
                const japanHolidaysObject  = await holidayListData();
                const japanHolidays = Object.keys(japanHolidaysObject);
                const axiosInstance = createAxiosInstance();
                const response = await axiosInstance.get(`/workSchedule/${year}/${month}`);
                // console.log("response",response.data);
                const filteredData = response.data.filter(
                    (entry) =>
                        (entry.workType === '출근' || entry.workType === '휴일출근') &&
                        (role === 'ROLE_ADMIN' || entry.employee.team.teamLeaderId === username) // 어드민이면 팀장 ID 조건 제거
                );

                const employeeHours = {};
                const basicWorkTime = {};
                const usernames = {}; // 기존 username과 변수명 충돌 방지
                const businessDaysInMonth = GetBusinessDays(year, month, japanHolidays);
                // console.log("businessDaysIn" + year + month, businessDaysInMonth);
                filteredData.forEach((entry) => {
                    const { id } = entry.employee;
                    const checkIn = new Date(`${entry.checkInDate}T${entry.checkInTime}`);
                    const checkOut = new Date(`${entry.checkOutDate}T${entry.checkOutTime}`);
                    const breakStart = new Date(`${entry.checkInDate}T${entry.breakTimeIn}`);
                    const breakEnd = new Date(`${entry.checkInDate}T${entry.breakTimeOut}`);

                    const BasicCheckInMinutes = timeStringToMinutes(entry.employeeWorkDate.checkInTime);
                    const BasicCheckOutMinutes = timeStringToMinutes(entry.employeeWorkDate.checkOutTime);
                    const BasicBreakInMinutes = timeStringToMinutes( entry.employeeWorkDate.breakTimeIn);
                    const BasicBreakOutMinutes = timeStringToMinutes(entry.employeeWorkDate.breakTimeOut);
                    const basicWorkTimeInHours = (
                        (
                            (BasicCheckOutMinutes - BasicCheckInMinutes)
                            -
                            (BasicBreakOutMinutes - BasicBreakInMinutes)
                        ) / 60
                    ).toFixed(1);
                    const monthlyBasicWorkTime = (basicWorkTimeInHours * businessDaysInMonth).toFixed(1);

                    const workDuration = (checkOut - checkIn - (breakEnd - breakStart)) > 0
                        ? Math.floor((checkOut - checkIn - (breakEnd - breakStart)) / (1000 * 60 * 60))
                        : 0;
                    employeeHours[id] = (employeeHours[id] || 0) + Number(workDuration);
                    basicWorkTime[id] = monthlyBasicWorkTime;
                    usernames[id] = entry.employee.name;
                });

                setChartData(Object.keys(employeeHours).map((id) => ({
                    id,
                    username: usernames[id],
                    hours: employeeHours[id],
                    basicWorkTime: basicWorkTime[id],
                })));
            } catch (error) {
                alert("데이터를 불러올 수 없습니다. \n 다시 시도해주세요.")
                console.error("Error fetching work schedule data:");
            }
        };

        fetchData();
    }, [year, month]); // chartData 제거 (무한 루프 방지)

    const changeMonth = (direction) => {
        setMonth((prev) => {
            let newMonth = prev + direction;
            let newYear = year;

            if (newMonth < 1) {
                newYear -= 1;
                newMonth = 12;
            } else if (newMonth > 12) {
                newYear += 1;
                newMonth = 1;
            }

            setYear(newYear);
            return newMonth;
        });
    };


    function moveToDetail(id){
        window.alert("상세 페이지로 이동합니다 : " + id + " "+ year + "년" +  " " + month + "월");
        navigate(`/workSchedule/adminList/${id}`, { state: { year, month }});
    }

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button className="btn btn-secondary" onClick={() => changeMonth(-1)}>이전 달</button>
                <h3>{year}년 {month}월</h3>
                <button className="btn btn-secondary" onClick={() => changeMonth(1)}>다음 달</button>
            </div>
            <div className="table-responsive">
                <table className="table table-bordered
                style={{ tableLayout: 'fixed', width: '100%' }}">
                    <thead>
                    <tr>
                        <th className="table-header" style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>이름</th>
                        <th className="table-header" style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>기본 근무시간</th>
                        <th className="table-header" style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>총 근무시간</th>
                        <th className="table-header" style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>초과 근무시간</th>
                        <th className="table-header table-header-fixed"  style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>
                            <div className="x-axis-ticks">
                                {/* X축 눈금 값을 표시합니다. */}
                                {[0, 50, 100, 150, 200].map((tick) => (
                                    <span key={tick} className="x-axis-tick">
                                    {tick}
                                    </span>
                                ))}
                            </div>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {chartData.map((entry) => (
                        <tr key={entry.username}>
                            <td className="table-data" >
                                <i onClick={() => moveToDetail(entry.id)}>
                                    {entry.username}
                                </i>
                            </td>
                            <td className="table-data"> {entry.basicWorkTime}</td>
                            <td className="table-data"> {entry.hours}</td>
                            <td className="table-data"> {entry.hours - entry.basicWorkTime > 0 ? entry.hours - entry.basicWorkTime : "없음"}</td>
                            <td className="chart-cell">
                                <ResponsiveContainer width="100%" height={30}>
                                    <BarChart
                                        data={[entry]} // 각 행의 데이터를 배열로 전달
                                        layout="vertical"
                                        margin={{ top: 0, right: 0, left:0, bottom: 0 }}
                                    >
                                        <XAxis
                                            type="number"
                                            domain={[0, 250]}
                                            tickCount={7}
                                            hide={true}
                                        />
                                        <YAxis
                                            dataKey="username"
                                            type="category"
                                            hide={true}
                                        />
                                        <Bar dataKey="hours">
                                            <Cell fill={entry.hours >=
                                            140 || entry.hours <=
                                            entry.basicWorkTime ? "#c20000" : "#61e368"}
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminWorkScheduleDashboard;
