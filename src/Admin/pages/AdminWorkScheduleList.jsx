
import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../../config/index.css";
import holidayListData from "../../utils/holidayListData";
import useWorkData from "../../jobScedule/utils/WorkData";
import useWorkDefaultData from "../../jobScedule/utils/WorkDataDefault";
const AdminWorkScheduleList = () =>  {
    const { id } = useParams();
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [schedule, setSchedule] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const workDataList = useWorkData(year, month, id); // ✅ 데이터와 갱신 함수 가져오기
    // const workDefaultData = useWorkDefaultData();

    //     "2025-01-01": { attendanceType: "휴일", workType: "", checkInTime: "", checkOutTime: "", memo: "공휴일" },

    useEffect(() => {
        const fetchSchedule = async () => {
            setLoading(true);
            setError("");
            try{
                const holidayData = await holidayListData(); // 공휴일 데이터 가져오기
                const daysInMonth = new Date(year, month, 0).getDate();
                const todayKey = new Date().toISOString().split("T")[0]; // 오늘 날짜 형식 (YYYY-MM-DD)
                // 근무 데이터 가져오기
                const newSchedule = Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // 날짜 형식 통일 (YYYY-MM-DD)
                    const weekday = new Date(year, month - 1, day).toLocaleDateString("ja-JP", { weekday: "short" });
                    const isWeekend = weekday === "土" || weekday === "日"; // 주말 확인
                    const HolidayType = holidayData[key]  // 휴일 확인 (값이 존재하는지 체크)
                    const workType = workDataList.workData[key] || {}; // 근무 데이터가 존재하는지 체크
                    return {
                        date: `${day}`,
                        key,
                        weekday,
                        HolidayType,
                        checkInTime: workType.checkInTime || "",
                        checkOutTime: workType.checkOutTime || "",
                        checkOutDate: workType.checkOutDate || "",
                        memo: workType.memo || (HolidayType ? holidayData[key] : isWeekend ? "주말" : ""),
                        workType: workType.workType || "",
                        workLocation: workType.workLocation || "",
                        workPosition: workType.workPosition || "",
                        breakTimeIn: workType.breakTimeIn || "",
                        breakTimeOut: workType.breakTimeOut || "",
                        styleClass: key === todayKey ? "today" : (HolidayType ? "holiday" : isWeekend ? "weekend" : ""),
                        file: workType.workFileStatus > 0 ? "true" : "false",
                        fileName : workType.fileName || "",
                        fileUrl : workType.fileUrl || "",
                        fileId : workType.fileId || "",
                    };
                });
                setSchedule(newSchedule);
                setLoading(false);
            }catch (error){
                setError("근무 데이터를 불러오는데 실패했습니다." + error);
            } finally {
                setLoading(false);
            }
        };
        if (workDataList?.workData) {
            fetchSchedule();
        }
    }, [year, month, workDataList?.workData]); // 변경된 의존성만 추가

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

    const handleClickEdit = (date) => {
        navigate(`/workSchedule/adminDetail/${date}/${id}`);
    }

    function handleClickReceipt() {
        navigate(`/workSchedule/receipt/${year}-${String(month).padStart(2, '0')}/${id}`)
        window.alert("해당 페이지는 테스트 중입니다.")
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    return (
            <div className="container">
                <h2 className="text-dark mb-1">WORK SCHEDULE</h2>
                <div className="d-flex justify-content-center align-items-center">
                    <button onClick={() => changeMonth(-1)} className="btn">
                        <i class="bi bi-arrow-left-circle-fill fs-3"></i>
                    </button>
                    <h2 className="px-3">{year} / {String(month).padStart(2, "0")}</h2>
                    <button onClick={() => changeMonth(1)} className="btn">
                        <i class="bi bi-arrow-right-circle-fill fs-3"></i>
                    </button>
                </div>
                <button type="button" className="btn btn-secondary" onClick={handleClickReceipt}>
                    {month}월 영수증 첨부
                </button>
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th className="text-center">日付</th>
                            <th className="text-center">曜日</th>
                            <th className="text-center">休暇・勤怠</th>
                            <th className="text-center">区分</th>
                            <th className="text-center">開始時間</th>
                            <th className="text-center">終了時間</th>
                            <th className="text-center" style={{ maxWidth: "200px" }}>비고</th>
                        </tr>
                        </thead>
                        <tbody>
                        {schedule.map((day, index) => (
                            <tr key={index} >
                                <td className={day.styleClass}>
                                    {day.date}日 &nbsp;
                                    {day.workType? (
                                        <i className="bi bi-pencil-fill"
                                           onClick={() => handleClickEdit(day.key)}
                                        ></i>
                                    ) : null}
                                </td>
                                <td className={day.styleClass}>{day.weekday}</td>
                                <td className={day.styleClass}>{day.workType} </td>
                                <td className={day.styleClass}>{day.workPosition}</td>
                                <td className={day.styleClass}>{day.checkInTime} </td>
                                <td className={day.styleClass}>{day.checkOutTime} </td>
                                <td className={`${day.styleClass} text-truncate`}
                                    style={{ maxWidth: "300px" , minWidth: "200px"}}
                                >{day.memo}
                                    {day.file === "true" ? (
                                        <>&nbsp;
                                            <i className="bi bi-file-earmark-check-fill"
                                                onClick={() => handleClickEdit(day.key)}></i>
                                        </>
                                    ) : null}
                                </td>

                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
}
export default AdminWorkScheduleList;