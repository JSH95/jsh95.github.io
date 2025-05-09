
import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {Button, Card, Table} from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../../config/index.css";
import holidayListData from "../../utils/holidayListData";
import useWorkData from "../utils/WorkData";
import useWorkDefaultData from "../utils/WorkDataDefault";
import {getCheckStateText} from "../utils/getCheckStateText";
import createAxiosInstance from "../../config/api";
import ScheduleMemoPopup from "../utils/ScheduleMemoPopup";
import * as PropTypes from "prop-types";
import {useAuth} from "../../config/AuthContext";
import useWorkHours from "../utils/useWorkHours";
import {useLoading} from "../../utils/LoadingContext";

function CardContent(props) {
    return null;
}

CardContent.propTypes = {children: PropTypes.node};

const WorkScheduleList = () =>  {
    const { setIsProcessing } = useLoading();
        const { role, username } = useAuth();
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
        const [modalOpen, setModalOpen] = useState(false);
        const [workTime, setWorkTime] = useState({});
        const { data, loadingWorkHours, errorWorkHours } = useWorkHours(year, month, username, role, 0);
    //     "2025-01-01": { attendanceType: "휴일", workType: "", checkInTime: "", checkOutTime: "", memo: "공휴일" },

    useEffect(() => {
        if (!loadingWorkHours && data.length > 0) {
            console.log("받아온 데이터:", data);
            setWorkTime(data[0]); // 데이터가 있을 때만 사용
        }
    } , [data, loadingWorkHours, year, month]);

    useEffect(() => {
        const fetchSchedule = async () => {
            setLoading(true);
            setError("");
            try{
                if (workDefaultData.checkInTime === null) {
                    window.alert("勤務表の基本情報を設定してください。\n 該当ページに移動します。");
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
                        memo: workType.memo || (HolidayType ? holidayData[key] : isWeekend ? "週末" : ""),
                        workType: workType.workType || "",
                        workLocation: workType.workLocation || "",
                        workPosition: workType.workPosition || "",
                        // breakTimeIn: workType.breakTimeIn || "",
                        // breakTimeOut: workType.breakTimeOut || "",
                        breakTime: workType.breakTime || "",
                        styleClass: key === todayKey ? "today" : (HolidayType ? "holiday" : isWeekend ? "weekend" : ""),
                        styleClass2: workType.workStatus === "" ? "" :
                            (workType.workStatus ==="修正依頼" ? "change" :
                                workType.workStatus ==="再修正依頼" ? "change2" : "") ,
                        file: workType.workFileStatus > 0 ? "true" : "false",
                        fileName : workType.fileName || "",
                        fileUrl : workType.fileUrl || "",
                        fileId : workType.fileId || "",
                        checkState: workType.workStatus || "",
                        checkMemo: workType.checkMemo || "",
                        employeeId: workType.employeeId || "",
                        employeeName: workType.employeeName || "",
                    };
                });
                setSchedule(newSchedule);
                // console.log("근무 데이터:", newSchedule);
                setLoading(false);
            }catch (error){
                setError("勤務データの読み込みに失敗しました。" + error);
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

    // const handleClickMyPage = () => {
    //     const scheduleData  = {stateInfo : "true"};
    //     navigate("/workSchedule/dashBoard", {state: scheduleData });
    // }

    const handleClickEdit = (date) => {
        if(workDataList?.workData[date] === undefined) {
            navigate(`/workSchedule/detail/${date}`, {
                state: { isEditing: true }
            });
        } else {
            navigate(`/workSchedule/detail/${date}`);
        }

    }

    const checkStatesHandle = useCallback((schedule) => {
        const checkStates = Object.values(schedule).map(item => item.checkState);
        const text = getCheckStateText(checkStates);
        // console.log("checkStates", checkStates);
        // console.log("text", text);
        setDisplayText(text);
        localStorage.setItem("displayText", text); // 저장
    }, []);

    useEffect(() => {
        checkStatesHandle(schedule);
    }, [schedule, checkStatesHandle]);

    function handleClickReceipt() {
        navigate(`/workSchedule/receipt/${year}-${String(month).padStart(2, '0')}`)
    }

    const handleClickModal = () => {
        setModalOpen(true);
    };

    const handleClickSummit = async (key) => {
        switch (key) {
            case 0:
                if (window.confirm("勤務表を提出しますか？") === false) return;
                break;
            case 1:
                if (window.confirm("勤務表を再提出しますか？") === false) return;
                break;
            case 2:
                if (window.confirm("勤務表の提出を取り消しますか？") === false) return;
                break;
        }
        setIsProcessing(true);
        setLoading(true);
        try{
            const formData = new FormData();
            formData.append("year", year);
            formData.append("month", month);
            formData.append("workStatus", key);
            const axiosInstance = createAxiosInstance();
            await axiosInstance.post(
                "/workScheduleAdmin/summit", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    }
                });
            switch(key) {
                case 0:
                    alert("勤務表を提出しました。")
                    setDisplayText("sending")
                    localStorage.setItem("displayText", "sending"); // 저장
                    break;
                case 1:
                    alert("勤務表を再提出しました。")
                    setDisplayText("reSending")
                    localStorage.setItem("displayText", "reSending"); // 저장
                    break;
                case 2:
                    alert("勤務表の提出を取り消しました。")
                    setDisplayText("notSubmitted")
                    localStorage.setItem("displayText", "notSubmitted"); // 저장
                    break;
            }
        }catch (error){
            switch(key) {
                case 0, 1:
                    alert("ERROR : 勤務表の提出をもう一度お試しください。\n これ以上できない場合は、管理者にお問い合わせください。")
                    break;
                case 2:
                    alert("ERROR : 勤務票の取り消しをもう一度お試しください。\n これ以上できない場合は、管理者にお問い合わせください。")
                    break;
            }
        }finally {
            setLoading(false);
            setIsProcessing(false);
        }
    }

    return (
            <div className="container">
                <div className="d-flex justify-content-center align-items-center">
                    <button onClick={() => changeMonth(-1)} className="btn">
                        <i className="bi bi-arrow-left-circle-fill fs-3"></i>
                    </button>
                    <h2 className="px-3">{year} / {String(month).padStart(2, "0")} 月 勤務表</h2>
                    <button onClick={() => changeMonth(1)} className="btn">
                        <i className="bi bi-arrow-right-circle-fill fs-3"></i>
                    </button>
                </div>
                <div className="d-flex flex-wrap justify-content-center align-items-center text-center mb-4 gap-3">
                    { loading? "loading..." :<>
                        <button type="button" className="btn btn-light me-2" onClick={handleClickReceipt}>
                            {month}月の領収書
                        </button>
                            <div>
                                {displayText !== "request" ? <></>:
                                    <>
                                        <Button type="button" className="btn btn-success fw-bold me-3" onClick={handleClickModal}>
                                            修正事項確認
                                        </Button>
                                        <ScheduleMemoPopup
                                            schedule={schedule}
                                            open={modalOpen}
                                            onOpenChange={setModalOpen}
                                        />
                                    </>
                                }
                            </div>
                            {displayText === "request" ?
                                <button type="button" className="btn btn-secondary" onClick={() => handleClickSummit(1)}>
                                    勤務表再提出
                                </button>
                                : displayText === "sending" || displayText === "reSending"?
                                    <button type="button" className="btn btn-danger" onClick={() => handleClickSummit(2)}>
                                        申請キャンセル
                                    </button>
                                    :  displayText === "finalConfirm" ?
                                        <>
                                            <i className="bi bi-calendar-check"></i>
                                            承認完了
                                        </>
                                        : <button type="button" className="btn btn-secondary" onClick={() => handleClickSummit(0)}>
                                            勤務表提出
                                        </button>
                            }
                        </>
                    }
                </div>
                <div
                    className="table-responsive"
                    style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ddd" }}
                >
                    <table className="table">
                        <thead className="table-light sticky-top" style={{ top: "0", zIndex: 1 }}>
                        <tr>
                            <th className="text-center">日付</th>
                            <th className="text-center">曜日</th>
                            <th className="text-center">休暇・勤怠</th>
                            <th className="text-center">区分</th>
                            <th className="text-center">開始時間</th>
                            <th className="text-center">終了時間</th>
                            <th className="text-center" style={{ maxWidth: "200px" }}>その他</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ?
                            <tr>
                                <td colSpan="5" className="text-center">Loading...</td>
                            </tr>
                            :schedule.map((day) => (
                            <tr key={day.key} >
                                    <td className={day.styleClass}>
                                        <div className="d-flex align-items-center justify-content-center px-1">
                                            <span
                                                className="me-2 text-end"
                                                style={{
                                                    display: "inline-block",
                                                    minWidth: "32px", // 날짜 영역 고정폭 (한자리, 두자리 동일 너비)
                                                }}
                                            >
                                                {day.date}日
                                            </span>
                                        {displayText === "sending" || displayText === "reSending" || displayText === "confirm" || displayText === "finalConfirm"? null :
                                            <a
                                                onClick={() => handleClickEdit(day.key, displayText)}
                                                style={{ cursor: "pointer", transition: "color 0.2s ease-in-out" }}
                                                className="text-primary"
                                            >
                                                <i className="bi bi-pencil-fill"></i>
                                            </a>
                                        }
                                        </div>
                                    </td>
                                <td className={day.styleClass}>{day.weekday}</td>
                                <td className={day.styleClass}>{day.workType} </td>
                                <td className={day.styleClass}>{day.workPosition}</td>
                                <td className={day.styleClass}>
                                    {day.workPosition !== "休暇" ?
                                        day.workType !== "有給休暇" && day.workType !== "出勤" && day.workType !== "休日出勤" ? "-" : day.checkInTime
                                    : "-"
                                    }
                                </td>
                                <td className={day.styleClass}
                                    style={(day.checkOutDate !== day.key)  ?
                                        { color: 'red', fontWeight: 'bold' }
                                        : {}}
                                >
                                    {day.workPosition !== "休暇" ?
                                    day.workType !== "有給休暇" && day.workType !== "出勤" && day.workType !== "休日出勤" ? "-" :
                                        (day.checkOutTime ? ((day.checkOutDate !== day.key)  ?
                                        "次の日 " : "" )
                                        : "" )
                                        + day.checkOutTime
                                    : "-"}
                                </td>
                                <td className={`${day.styleClass} text-truncate`}
                                    style={{ maxWidth: "300px" , minWidth: "200px"}}
                                >
                                    {day.file === "true" ? (
                                        <a href={day.fileUrl}
                                           style={{ cursor: "pointer", transition: "color 0.2s ease-in-out" }}
                                           className="text-primary"
                                           target="_blank"
                                        >
                                            <i className="bi bi-file-earmark-check-fill"></i>
                                        </a>
                                    ) : (null)}&nbsp;
                                    {day.memo}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                {role === "ROLE_ADMIN" ?
                <div className=" justify-content-center align-items-center mb-4">
                    <div className="mt-4 p-4">
                        <h2 className="text-xl mb-4">勤務時間の要約(管理者のみ)</h2>
                        <div className="row">

                            <div className="col-12 col-lg-4 mb-3">
                                <div className="card shadow-sm p-3">
                                    <h5 className="card-header fw-bold">出勤状況</h5>
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>所定日数</span>
                                            <span>{workTime?.scheduledWorkDays ?? "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>出勤日数</span>
                                            <span>{workTime?.totalWorkDays ?? "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>法定外休日出勤日数</span>
                                            <span>{workTime?.holidayWorkNonLegal ?? "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>法定休日出勤日数</span>
                                            <span>{workTime?.holidayWorkLegal ?? "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>欠勤日数</span>
                                            <span>{workTime?.absences ?? "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>遅刻日数</span>
                                            <span>{workTime?.lateCount ?? "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>早退日数</span>
                                            <span>{workTime?.earlyLeaveCount ?? "-"}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="col-12 col-lg-4">
                                <div className="card shadow-sm p-3 mb-3">
                                    <h5 className="card-header fw-bold">勤務時間</h5>
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>総労働時間</span>
                                            <span>{workTime?.totalWorkHours ?? "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>実働時間</span>
                                            <span>{workTime?.actualWorkHours ?? "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>所定時間</span>
                                            <span>{workTime?.basicWorkHours ?? "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>所定内労働時間</span>
                                            <span>{workTime?.withinScheduledHours ?? "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>残業時間</span>
                                            <span>{workTime?.overScheduledHours ?? "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>法定内時間外労働時間</span>
                                            <span>{workTime?.overScheduledHours ?? "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>法定時間外労働時間</span>
                                            <span>{workTime?.statutoryOvertime ?? "-"}</span>
                                        </li>

                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>法定外休日労働時間</span>
                                            <span>{workTime?.holidayWorkNonLegal ?? "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>法定休日労働時間</span>
                                            <span>{workTime?.holidayWorkLegal ?? "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>深夜労働時間</span>
                                            <span>{workTime?.midnightWork ?? "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>遅刻時間</span>
                                            <span>{workTime?.lateMinutes ?? "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>早退時間</span>
                                            <span>{workTime?.earlyLeaveMinutes ?? "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>所定不足時間</span>
                                            <span>{workTime?.deficitScheduledHours ?? "-"}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>


                            <div className="col-12 col-lg-4">
                                <div className="card shadow-sm p-3">
                                    <h5 className="card-header fw-bold">休日・休暇取得 (x)</h5>
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>公休日数</span>
                                            <span>0</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>有給休暇日数</span>
                                            <span>0</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>本日までの有給休暇残数</span>
                                            <span>0</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>振替休日日数</span>
                                            <span>0</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>本日までの振替休日残数</span>
                                            <span>0</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>代休日数</span>
                                            <span>0</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>本日までの代休残数</span>
                                            <span>0</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>特別休暇日数</span>
                                            <span>0</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>休職日数</span>
                                            <span>0</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                : null }
            </div>
        );
}
export default WorkScheduleList;