
import React, {useCallback, useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams, useSearchParams} from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../../config/index.css";
import holidayListData from "../../utils/holidayListData";
import useWorkData from "../../jobScedule/utils/WorkData";
import createAxiosInstance from "../../config/api";
import {getCheckStateText} from "../../jobScedule/utils/getCheckStateText";
import {useAuth} from "../../config/AuthContext";
import useWorkHours from "../../jobScedule/utils/useWorkHours";

const AdminWorkScheduleList = () =>  {
    const { id } = useParams();
    const { role } = useAuth();
    const [searchParams] = useSearchParams();
    const selectedYear = searchParams.get("year") || new Date().getFullYear();
    const selectedMonth = searchParams.get("month") || new Date().getMonth() + 1;
    const [year, setYear] = useState(Number(selectedYear));
    const [month, setMonth] = useState(Number(selectedMonth));
    const [schedule, setSchedule] = useState([]);

    const loadFromLocalStorage = () => {
        const savedData = localStorage.getItem('checkedItems');
        return savedData ? JSON.parse(savedData) : {};
    };

    const [checkedItems, setCheckedItems] = useState(loadFromLocalStorage());
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const workDataList = useWorkData(year, month, id); // ✅ 데이터와 갱신 함수 가져오기
    const [displayText, setDisplayText] = useState("");
    const [workTime, setWorkTime] = useState({});
    const { data, loadingWorkHours } = useWorkHours(year, month, id, role, 0);

    useEffect(() => {
        if (!loadingWorkHours && data.length > 0) {
            setWorkTime(data[0]); // 데이터가 있을 때만 사용
        }
    } , [data, loadingWorkHours, year, month]);

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
                        memo: workType.memo || (HolidayType ? holidayData[key] : isWeekend ? "週末" : ""),
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
                        checkState: workType.workStatus || "",
                        checkMemo: workType.checkMemo || "",
                    };
                });
                setSchedule(newSchedule);
                setLoading(false);
            }catch (error){
                setError("勤務データの読み込みに失敗しました。" + error);
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
        navigate(`/workSchedule/receipt/${year}-${String(month).padStart(2, '0')}/${id}`);
    }

    useEffect(() => {
        const savedChecks = localStorage.getItem("checkedItems");
        if (savedChecks) {
            setCheckedItems(JSON.parse(savedChecks)); // 로컬스토리지에서 가져오기
        }
    }, []);

    const handleCheckboxChange = (key) => {
        setCheckedItems((prev) => {
            const updated = { ...prev };
            if (updated[key]?.checked) {
                delete updated[key]; // 체크 해제 시 제거
            } else {
                updated[key] = { checked: true, checkStateMemo: "" }; // 체크 시 추가
            }
            saveToLocalStorage(updated); // 변경된 상태 저장
            return updated;
        });
    };

    const handleMemoChange = (key, memo) => {
        setCheckedItems((prev) => {
            const updated = { ...prev, [key]: { ...prev[key], checkStateMemo: memo } };
            saveToLocalStorage(updated); // 변경된 상태 저장
            return updated;
        });
    };



    const saveToLocalStorage = (data) => {
        localStorage.setItem('checkedItems', JSON.stringify(data));
    };

    useEffect(() => {
        saveToLocalStorage(checkedItems);
    }, [checkedItems]);

    const handleSave = async (keyData) => {

        switch (displayText) {
            case "notSubmitted":
                alert("まだ勤務表を提出していない社員です。");
                return;
            case "request":
                alert("まだ勤務表を再修正していません。");
                return;
        }

        const checkedItemsData = Object.entries(checkedItems)
            .filter(([key, item]) => item.checked)
            .map(([key, item]) => ({
                checkDate: key,
                checkStateMemo: item.checkStateMemo || ""
            }));
        if(keyData === 0 ) {
            if (checkedItemsData.length === 0) {
                alert("チェックされた項目がありません。");
                return;
            }
            const missingMemo = checkedItemsData.some((item) => !item.checkStateMemo || item.checkStateMemo.trim() === "");
            if (missingMemo) {
                alert("理由を入力していない項目があります。");
                return;
            }
            const confirmDelete = window.confirm("該当社員に修正依頼を送りますか？");
            if (!confirmDelete) return;
            try {
                const axiosInstance = createAxiosInstance();
                await axiosInstance.post(`/workScheduleAdmin/${id}`,{
                    year,
                    month,
                    checkedDatesDto: checkedItemsData
                });
                alert(id + "の修正依頼が完了しました。");
                localStorage.removeItem("checkedItems");
                setCheckedItems({});
                setDisplayText("request");
            } catch (error) {
                alert("依頼中にエラーが発生しました。");
            }
        } else if(keyData === 4) {
            const confirmDelete = window.confirm("承認を取り消しますか？");
            if (!confirmDelete) return;
            try {
                const axiosInstance = createAxiosInstance();
                await axiosInstance.post(`/workScheduleAdmin/approval/${id}`,{
                    year,
                    month,
                    checkedDatesDto: null,
                    keyData
                });
                alert(id + "の承認が取り消されました。");
                setDisplayText("notSubmitted");
            } catch (error) {
                alert("承認取消中にエラーが発生しました。");
            }
        } else {
            try {
                const axiosInstance = createAxiosInstance();
                await axiosInstance.post(`/workScheduleAdmin/approval/${id}`,{
                    year,
                    month,
                    checkedDatesDto: [],
                    keyData
                });
                alert(id + "の承認が完了しました。");
                switch (keyData) {
                    case 1:
                        setDisplayText("confirm")
                        break;
                    case 2:
                        setDisplayText("finalConfirm")
                        break;
                    case 3:
                        setDisplayText("check")
                        break;
                }
            } catch (error) {
                switch (keyData) {
                    case 1:
                        alert("承認中にエラーが発生しました。");
                        break;
                    case 2:
                        alert("最終確認提出中にエラーが発生しました。");
                        break;
                    case 3:
                        alert("確認完了処理中にエラーが発生しました。");
                        break;
                }
                // console.error(error);
            }
        }
    };

    const checkStatesHandle = useCallback((schedule) => {
        const checkStates = Object.values(schedule).map(item => item.checkState);
        const text = getCheckStateText(checkStates);
        setDisplayText(text);
    }, []);

    useEffect(() => {
        checkStatesHandle(schedule);
    }, [schedule, checkStatesHandle]);

    // if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    return (
            <div className="container">
                <h2 className="text-dark mb-1">{workTime?.employeeName || ""}の勤務表</h2>
                <div className="d-flex justify-content-center align-items-center">
                    <button onClick={() => changeMonth(-1)} className="btn">
                        <i className="bi bi-arrow-left-circle-fill fs-3"></i>
                    </button>
                    <h2 className="px-3">{year} / {String(month).padStart(2, "0")} 月</h2>
                    <button onClick={() => changeMonth(1)} className="btn">
                        <i className="bi bi-arrow-right-circle-fill fs-3"></i>
                    </button>
                </div>
                {loading ? "Loading ...":
                    <div className="d-flex justify-content-center align-items-center mb-2">
                    <button type="button" className="btn btn-secondary me-3" onClick={handleClickReceipt}>
                        {month}월 영수증 첨부
                    </button>
                    {displayText !== "confirm" && displayText !== "notSubmitted"? <button onClick={() => handleSave(0)} className="btn btn-secondary me-4" type="button">수정 요청</button>
                        : null
                    }
                    {/*{displayText !== "confirm" ? role === "ROLE_ADMIN" ?*/}
                    {/*    <button onClick={() => handleSave(1)} className="btn btn-primary me-4" type="button">승 인</button>*/}
                    {/*    :*/}
                    {/*    role === "ROLE_TEAM_LEADER" ?*/}
                    {/*        <button onClick={() => handleSave(2)} className="btn btn-primary me-4" type="button">승인 요청</button>*/}
                    {/*        :*/}
                    {/*        <button onClick={() => handleSave(3)} className="btn btn-primary me-4" type="button">승인 요청</button>*/}
                    {/*    :*/}
                    {/*    <button onClick={() => handleSave(4)} className="btn btn-danger me-4" type="button">승인 취소</button>*/}
                    {/*}*/}
                    {displayText === "notSubmitted" ? <h5>제출 전</h5> :
                        displayText === "request" ? <h5>수정 요청 중</h5> :
                        role === "ROLE_ADMIN" ?
                        displayText === "finalConfirm" ? <button onClick={() => handleSave(1)} className="btn btn-primary me-4" type="button">최종 승인</button>
                            :  displayText === "confirm" ? <button onClick={() => handleSave(4)} className="btn btn-danger me-4" type="button">승인 취소</button>
                                : displayText === "check" ? <h5> 주임 승인 전</h5>
                                    :  <h5>팀장 승인 전</h5>

                    : role === "ROLE_TEAM_LEADER" ?
                            displayText === "confirm" ? <h5>최종 승인 완료</h5>:
                            displayText === "check" ? <button onClick={() => handleSave(2)} className="btn btn-primary me-4" type="button">승인 요청</button>
                                : displayText === "finalConfirm" ? <button onClick={() => handleSave(4)} className="btn btn-danger me-4" type="button">승인 취소</button>
                                    : <h5> 팀장 승인 전</h5>
                    : displayText === "finalConfirm" ? <h5>최종 승인 완료</h5>:
                                    displayText === "confirm" ? <h5>주임 승인 완료</h5>:
                                        displayText === "check" ? <button onClick={() => handleSave(4)} className="btn btn-danger me-4" type="button">승인 취소</button> :
                                            displayText === "reSending" ? <button onClick={() => handleSave(3)} className="btn btn-primary me-4" type="button">재승인 요청</button> :
                                                displayText === "sending" ? <button onClick={() => handleSave(3)} className="btn btn-primary me-4" type="button">승인 요청</button> : null
                    }
                    <h5 className="ms-2">| log: {displayText} </h5>
                </div>}
                <div
                    className="table-responsive"
                    style={{ maxHeight: "500px", overflowY: "auto", border: "1px solid #ddd" }}
                >
                    <table className="table table-hover">
                        <thead className="table-light sticky-top" style={{ top: "0", zIndex: 1 }}>
                        <tr>
                            {displayText !== "confirm" && displayText !== "notSubmitted" ? <th className="text-center">수정 사항</th> : null}
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
                        {loading ? null : schedule.map((day) => (
                            <tr key={day.key} onClick={() => handleClickEdit(day.key)}
                                style={{
                                    cursor: "pointer",
                                    transition: "color 0.2s ease-in-out",
                                }}>
                                {displayText !== "confirm" && displayText !== "notSubmitted" ? <td className={day.styleClass}
                                     onClick={(e) => e.stopPropagation()} // row 클릭 방지
                                    >
                                         <input
                                        type="checkbox"
                                        checked={!!checkedItems[day.key]}
                                        onChange={() => handleCheckboxChange(day.key)}
                                        className="checkbox-container"
                                        style={{transform: "scale(1.4)", cursor: "pointer"}}
                                    />
                                    {checkedItems[day.key]?.checked && (
                                        <input
                                            type="text"
                                            placeholder="理由入力"
                                            value={checkedItems[day.key]?.checkStateMemo || ""}
                                            onChange={(e) => handleMemoChange(day.key, e.target.value)}
                                            style={{marginLeft: "8px", width: "150px"}}
                                        />
                                    )}
                                </td>
                                    : null}
                                <td className={day.styleClass}>
                                    {day.date}日
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
                                    style={{ maxWidth: "300px" , minWidth: "200px"}}>
                                    {day.file === "true" ? (
                                        <a href={day.fileUrl}
                                           style={{ cursor: "pointer", transition: "color 0.2s ease-in-out" }}
                                           className="text-primary"
                                           target="_blank"
                                           onClick={(e) => e.stopPropagation()}
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
            </div>
        );
}
export default AdminWorkScheduleList;