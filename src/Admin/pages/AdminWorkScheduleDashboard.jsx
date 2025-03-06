import React, { useEffect, useState } from "react";
import {BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell} from "recharts";
import "../../config/index.css";
import createAxiosInstance from "../../config/api";
import {useNavigate} from "react-router-dom";


const AdminWorkScheduleDashboard = () => {
    const navigate = useNavigate();
    const [chartData, setChartData] = useState([]);
    const today = new Date();
    const year = new Date(today).getFullYear();
    const month = new Date(today).getMonth()+ 1;
    // console.log("chartData",chartData);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const axiosInstance = createAxiosInstance();
                const response = await axiosInstance.get(`/workSchedule/${year}/${month}`);
                const employeeHours = {};
                const basicWorkTime = {};
                const username = {};
                // console.log("1",response.data)
                response.data
                    .filter((entry) => entry.workType === '출근' || entry.workType === '휴일출근') // '출근' 또는 '휴일출근'인 항목만 필터링
                    .forEach((entry) => {
                    const { id } = entry.employee;
                    const checkIn = new Date(`${entry.checkInDate}T${entry.checkInTime}`);
                    const checkOut = new Date(`${entry.checkOutDate}T${entry.checkOutTime}`);
                    const breakStart = new Date(`${entry.checkInDate}T${entry.breakTimeIn}`);
                    const breakEnd = new Date(`${entry.checkInDate}T${entry.breakTimeOut}`);
                    const workDuration = (checkOut - checkIn - (breakEnd - breakStart)) / (1000 * 60 * 60);
                    employeeHours[id] = (employeeHours[id] || 0) + workDuration;
                    basicWorkTime[id] = entry.basicWorkTime;
                    username[id] = entry.employee.name;
                    });

                setChartData(Object.keys(employeeHours).map((id) => ({
                    id,
                    username: username[id],
                    hours: employeeHours[id],
                    basicWorkTime: basicWorkTime[id],
                })));
            } catch (error) {
                console.error("Error fetching work schedule data:", error);
            }
        };

        fetchData();
    }, [ year, month, chartData]);

    function moveToDetail(id){
        window.alert("상세 페이지로 이동합니다 :" + id);
        navigate(`/workSchedule/adminList/${id}`);
    }

    return (
        <div className="container">
            <div className="table-responsive">
                <table className="table table-responsive table-bordered">
                    <thead>
                    <tr>
                        <th className="table-header">이름</th>
                        <th className="table-header">기본 근무시간</th>
                        <th className="table-header">총 근무시간</th>
                        <th className="table-header">초과 근무시간</th>
                        <th className="table-header">
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
