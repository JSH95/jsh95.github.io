
import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../../config/index.css";
import holidayListData from "../../utils/holidayListData";
import useWorkData from "../utils/WorkData";
import useWorkDefaultData from "../utils/WorkDataDefault";
import {getCheckStateText} from "../utils/getCheckStateText";
import createAxiosInstance from "../../config/api";
const WorkScheduleList = () =>  {

        const today = new Date();
        const [year, setYear] = useState(today.getFullYear());
        const [month, setMonth] = useState(today.getMonth() + 1);
        const [schedule, setSchedule] = useState([]);
        const navigate = useNavigate();
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");
    const workDataList = useWorkData(year, month); // ✅ 데이터와 갱신 함수 가져오기
    const workDefaultData = useWorkDefaultData();
    const [displayText, setDisplayText] = useState("");

    //     "2025-01-01": { attendanceType: "휴일", workType: "", checkInTime: "", checkOutTime: "", memo: "공휴일" },

    useEffect(() => {
        const fetchSchedule = async () => {
            setLoading(true);
            setError("");
            try{
                if (workDefaultData.checkInTime === null) {
                    window.alert("기본 근무시간을 설정해 주세요.");
                    navigate("/workSchedule/dashBoard");
                    return;
                }

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
                        styleClass2: workType.workStatus === "" ? "" :
                            (workType.workStatus ==="수정요청" ? "change" :
                                workType.workStatus ==="재수정요청" ? "change2" : "") ,
                        file: workType.workFileStatus > 0 ? "true" : "false",
                        fileName : workType.fileName || "",
                        fileUrl : workType.fileUrl || "",
                        fileId : workType.fileId || "",
                        checkState: workType.workStatus || "",
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
        if (workDataList?.workData && Object.keys(workDefaultData).length > 0) {
            fetchSchedule();
        }
    }, [year, month, workDataList?.workData, workDefaultData]); // 변경된 의존성만 추가

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

    const handleClickMyPage = () => {
        const scheduleData  = {stateInfo : "true"};
        navigate("/workSchedule/dashBoard", {state: scheduleData });
    }

    const handleClickEdit = (date) => {
        navigate(`/workSchedule/detail/${date}`);
    }
    useEffect(() => {
        const checkStates = Object.values(schedule).map(item => item.checkState);
        const text = getCheckStateText(checkStates);
        console.log("text : ", checkStates)
        setDisplayText(text)
    }, [schedule]);


    function handleClickReceipt() {
        navigate(`/workSchedule/receipt/${year}-${String(month).padStart(2, '0')}`)
    }



    function handleClickModal() {
        alert("준비중입니다.")
    }

    const handleClickSummit = async () => {
        try{
            const axiosInstance = createAxiosInstance();
            const response = await axiosInstance.get(
                `/workScheduleAdmin/summit`
            );
            console.log("response : ", response);
            alert("근무표를 제출하였습니다.")
        }catch (error){
            alert("근무표를 제출을 다시 시도해 주세요.")
        }

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
                <div className="d-flex justify-content-center align-items-center">
                    <button type="button" className="btn btn-primary me-3" onClick={handleClickMyPage}>
                        기본 정보
                    </button>
                    <button type="button" className="btn btn-secondary me-4" onClick={handleClickReceipt}>
                        {month}월 영수증
                    </button>
                    <button type="button" className="btn btn-info fw-bold me-3" onClick={handleClickModal}>상태 : {displayText}</button>
                    {i ? "": <button type="button" className="btn btn-secondary" onClick={handleClickSummit}>
                        근무표 제출
                    </button>}
                </div>
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
                                        <i className="bi bi-pencil-fill"
                                           onClick={() => handleClickEdit(day.key)}
                                        >
                                        </i>
                                </td>
                                <td className={day.styleClass}>{day.weekday}</td>
                                <td className={day.styleClass}>{day.workType} </td>
                                <td className={day.styleClass}>{day.workPosition}</td>
                                <td className={day.styleClass}>
                                    {day.workType !== "출근" && day.workType !== "휴일출근" ? "-" : day.checkInTime}
                                </td>
                                <td className={day.styleClass}
                                    style={(day.checkOutDate !== day.key)  ?
                                        { color: 'red', fontWeight: 'bold' }
                                        : {}}
                                >

                                    {day.workType !== "출근" && day.workType !== "휴일출근" ? "-" :
                                        (day.checkOutTime ? ((day.checkOutDate !== day.key)  ?
                                        "次の日 " : "" )
                                        : "" )
                                        + day.checkOutTime}

                                </td>
                                <td className={`${day.styleClass} text-truncate`}
                                    style={{ maxWidth: "300px" , minWidth: "200px"}}
                                >
                                    {day.file === "true" ? (
                                        <>
                                            <i className="bi bi-file-earmark-check-fill"
                                                onClick={() => handleClickEdit(day.key)}></i>
                                        </>
                                    ) : (null)}&nbsp;
                                    {day.memo}
                                </td>

                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
}
export default WorkScheduleList;