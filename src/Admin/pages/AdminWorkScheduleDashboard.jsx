import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import "../../config/index.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../config/AuthContext";
import useWorkHours from "../../jobScedule/utils/useWorkHours";

const AdminWorkScheduleDashboard = () => {
    const { role, username } = useAuth();
    const navigate = useNavigate();
    const [chartData, setChartData] = useState([]);
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const { data, loadingWorkHours, errorWorkHours } = useWorkHours(year, month, username, role, 1);

    useEffect(() => {
        if (!loadingWorkHours && data.length > 0) {
            setChartData(data);
        }
    }, [data, loadingWorkHours]);

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

    function moveToDetail(id) {
        // window.alert("詳細ページに移動します：" + id + " " + year + "年 " + month + "月");
        navigate(`/workSchedule/adminList/${id}?year=${year}&month=${month}`);
    }

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button className="btn btn-secondary" onClick={() => changeMonth(-1)}>前の月</button>
                <h3>{year}年 {month}月</h3>
                <button className="btn btn-secondary" onClick={() => changeMonth(1)}>次の月</button>
            </div>
            <div className="table-responsive">
                <table className="table table-hover" style={{ tableLayout: 'fixed', width: '100%' }}>
                    <thead>
                    <tr>
                        <th className="table-header" style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>承認段階</th>
                        <th className="table-header" style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>名前</th>
                        <th className="table-header" style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>基本勤務時間（+40時間）</th>
                        <th className="table-header" style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>総勤務時間</th>
                        <th className="table-header" style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>超過勤務時間</th>
                        <th className="table-header table-header-fixed" style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>
                            <div className="x-axis-ticks">
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
                    {!errorWorkHours ? chartData
                            .sort((a, b) => a.employeeName.localeCompare(b.employeeName))
                            .map((entry) => (
                                <tr key={entry.employeeName}
                                    className="hover:bg-blue-50 cursor-pointer transition"
                                    onClick={() => moveToDetail(entry.employeeId)}
                                    style={{
                                        cursor: "pointer",
                                        transition: "color 0.2s ease-in-out",
                                    }}
                                >
                                    <td className="table-data">{entry.status}</td>
                                    <td className="table-data">{entry.employeeName}</td>
                                    <td className="table-data">{Number(entry.basicWorkHours) + 40}</td>
                                    <td className="table-data">{entry.totalWorkHours}</td>
                                    <td className="table-data">{entry.totalWorkHours - (entry.basicWorkHours + 40) > 0 ? (entry.totalWorkHours - (entry.basicWorkHours + 40)).toFixed(1) : "なし"}</td>
                                    <td className="chart-cell">
                                        <ResponsiveContainer width="100%" height={30}>
                                            <BarChart
                                                data={[entry]}
                                                layout="vertical"
                                                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                                            >
                                                <XAxis type="number" domain={[0, 250]} tickCount={7} hide={true} />
                                                <YAxis dataKey="username" type="category" hide={true} />
                                                <Bar dataKey="totalWorkHours">
                                                    <Cell fill={
                                                        entry.totalWorkHours >= (Number(entry.basicWorkHours) + 40) ? "#0065ff"
                                                            : entry.totalWorkHours >= Number(entry.basicWorkHours) ? "#61e368"
                                                                : "#c20000"
                                                    } />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </td>
                                </tr>
                            ))
                        : "エラー"
                    }
                    </tbody>
                </table>
            </div>

            <div className="mb-2 mt-4">
                <h2>今月の社員別勤務サマリー（テスト中）</h2>
                <table border="1" cellPadding="8">
                    <thead>
                    <tr>
                        <th>氏名</th>
                        <th>出社日数</th>
                        <th>実作業時間</th>
                        <th>遅刻</th>
                        <th>夜勤（時間）</th>
                        <th>欠勤</th>
                        <th>代休</th>
                        <th>有給</th>
                        <th>振休</th>
                        <th>特別休</th>
                        <th>慶弔休</th>
                        <th>休日出勤</th>
                        <th>本社出勤</th>
                    </tr>
                    </thead>
                    <tbody>
                    {chartData.map((s) => (
                        <tr key={s.employeeId}>
                            <td>{s.employeeName}</td>
                            <td>{s.totalWorkDays}</td>
                            <td>{s.totalWorkHours}</td>
                            <td>{s.lateCount}</td>
                            <td>{s.nightShiftHours}</td>
                            <td>{s.absences}</td>
                            <td>{s.substituteHolidays}</td>
                            <td>{s.paidLeave}</td>
                            <td>{s.dayOff}</td>
                            <td>{s.specialLeave}</td>
                            <td>{s.condolenceLeave}</td>
                            <td>{s.holidayWork}</td>
                            <td>{s.headOfficeAttendance}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminWorkScheduleDashboard;
