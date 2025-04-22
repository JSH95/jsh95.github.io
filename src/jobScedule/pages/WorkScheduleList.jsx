
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
        const { data, loadingWorkHours, errorWorkHours } = useWorkHours(year, month, username, role);
    //     "2025-01-01": { attendanceType: "휴일", workType: "", checkInTime: "", checkOutTime: "", memo: "공휴일" },

    useEffect(() => {
        if (!loadingWorkHours && data.length > 0) {
            // console.log("받아온 데이터:", data);
            setWorkTime(data[0]); // 데이터가 있을 때만 사용
        }
    } , [data, loadingWorkHours, year, month]);

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
                        // breakTimeIn: workType.breakTimeIn || "",
                        // breakTimeOut: workType.breakTimeOut || "",
                        breakTime: workType.breakTime || "",
                        styleClass: key === todayKey ? "today" : (HolidayType ? "holiday" : isWeekend ? "weekend" : ""),
                        styleClass2: workType.workStatus === "" ? "" :
                            (workType.workStatus ==="수정요청" ? "change" :
                                workType.workStatus ==="재수정요청" ? "change2" : "") ,
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
                if (window.confirm("근무표를 제출하시겠습니까?") === false) return;
                break;
            case 1:
                if (window.confirm("근무표를 재제출하시겠습니까?") === false) return;
                break;
            case 2:
                if (window.confirm("근무표 제출을 취소하시겠습니까?") === false) return;
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
                    alert("근무표를 제출하였습니다.")
                    setDisplayText("제출 중")
                    break;
                case 1:
                    alert("근무표를 재제출하였습니다.")
                    setDisplayText("재제출 중")
                    break;
                case 2:
                    alert("근무표 제출을 취소하였습니다.")
                    setDisplayText("미제출")
                    break;
            }
        }catch (error){
            switch(key) {
                case 0, 1:
                    alert("근무표를 제출을 다시 시도해 주세요.")
                    break;
                case 2:
                    alert("근무표 취소를 다시 시도해 주세요.")
                    break;
            }
        }finally {
            setLoading(false);
            setIsProcessing(false);
        }
    }

    return (
            <div className="container">
                <h2 className="text-dark mb-1">WORK SCHEDULE</h2>
                <div className="d-flex justify-content-center align-items-center">
                    <button onClick={() => changeMonth(-1)} className="btn">
                        <i className="bi bi-arrow-left-circle-fill fs-3"></i>
                    </button>
                    <h2 className="px-3">{year} / {String(month).padStart(2, "0")}</h2>
                    <button onClick={() => changeMonth(1)} className="btn">
                        <i className="bi bi-arrow-right-circle-fill fs-3"></i>
                    </button>
                </div>
                <div className="d-flex justify-content-center align-items-center mb-4">
                    { loading? "loading..." :<>
                    <button type="button" className="btn btn-light me-4" onClick={handleClickReceipt}>
                        {month}월 영수증
                    </button>
                            <div>
                                {displayText !== "수정 요청" ? <></>:
                                    <>
                                        <Button type="button" className="btn btn-success fw-bold me-3" onClick={handleClickModal}>
                                            수정 요청 사항
                                        </Button>
                                        <ScheduleMemoPopup
                                            schedule={schedule}
                                            open={modalOpen}
                                            onOpenChange={setModalOpen}
                                        />
                                    </>
                                }
                            </div>
                            {displayText === "수정 요청" ?
                                <button type="button" className="btn btn-secondary" onClick={() => handleClickSummit(1)}>
                                    근무표 재제출
                                </button>
                                : displayText === "제출 중" || displayText === "재제출 중"?
                                    <button type="button" className="btn btn-danger" onClick={() => handleClickSummit(2)}>
                                        제출 취소
                                    </button>
                                    :  displayText === "승인 완료" ?
                                        <>
                                            <i className="bi bi-calendar-check"></i>
                                            승인완료
                                        </>
                                        : <button type="button" className="btn btn-secondary" onClick={() => handleClickSummit(0)}>
                                            근무표 제출
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
                            <th className="text-center" style={{ maxWidth: "200px" }}>비고</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ?
                            <tr>
                                <td colSpan="5" className="text-center">Loading...</td>
                            </tr>
                            :schedule.map((day, index) => (
                            <tr key={index} >
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
                                        {displayText === "제출 중" || displayText === "재제출 중" || displayText === "승인 완료" ? null :
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
                                    {day.workPosition !== "휴가" ?
                                        day.workType !== "유급휴가" && day.workType !== "출근" && day.workType !== "휴일출근" ? "-" : day.checkInTime
                                    : "-"
                                    }
                                </td>
                                <td className={day.styleClass}
                                    style={(day.checkOutDate !== day.key)  ?
                                        { color: 'red', fontWeight: 'bold' }
                                        : {}}
                                >
                                    {day.workPosition !== "휴가" ?
                                    day.workType !== "유급휴가" && day.workType !== "출근" && day.workType !== "휴일출근" ? "-" :
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
                <div className=" justify-content-center align-items-center mb-4">
                    <div className="mt-4 p-4">
                        <h2 className="text-xl mb-4">근무 시간 요약(테스트 중)</h2>
                        <div className="row">
                            <div className="col-12 col-lg-4">
                                <div className="card shadow-sm p-3 mb-3">
                                    <h5 className="card-header fw-bold">기본 근무 정보</h5>
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>총 근무 시간</span>
                                            <span>{workTime?.totalWorkHours ? workTime?.totalWorkHours + " h"  : "-"}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>실업시간</span>
                                            <span>16:05</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>소정 시간</span>
                                            <span>162:45</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>소정 내 근무 시간</span>
                                            <span>15:26</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>잔업 시간</span>
                                            <span>0:39</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-12 col-lg-4 mb-3">
                                <div className="card shadow-sm p-3">
                                    <h5 className="card-header fw-bold">법정 시간</h5>
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>법정내 시간외 노동시간</span>
                                            <span>0:34</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>법정시간 외 근무시간</span>
                                            <span>0:05</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>법정외 휴일 노동시간</span>
                                            <span>0:00</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>법정 휴일 근무 시간</span>
                                            <span>0:00</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>자정 근무 시간</span>
                                            <span>0:00</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-12 col-lg-4">
                                <div className="card shadow-sm p-3">
                                    <h5 className="card-header fw-bold">휴일 및 휴가</h5>
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>공휴일 수</span>
                                            <span>9.0일</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>유급휴가 일수</span>
                                            <span>0.0일</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>오늘까지 유급휴가잔수</span>
                                            <span>0.0일</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>이체 휴일 일수</span>
                                            <span>0.0일</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>오늘까지 이체 휴일 잔수</span>
                                            <span>0.0일</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
}
export default WorkScheduleList;