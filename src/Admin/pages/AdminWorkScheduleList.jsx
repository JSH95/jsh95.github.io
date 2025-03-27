
import React, {useCallback, useEffect, useState} from 'react';
import { useLocation, useNavigate, useParams} from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../../config/index.css";
import holidayListData from "../../utils/holidayListData";
import useWorkData from "../../jobScedule/utils/WorkData";
import createAxiosInstance from "../../config/api";
import {getCheckStateText} from "../../jobScedule/utils/getCheckStateText";
import {useAuth} from "../../config/AuthContext";

const AdminWorkScheduleList = () =>  {
    const { id } = useParams();
    const { role, username } = useAuth();
    const location = useLocation();
    const { year : selectedYear, month: selectedMonth } = location.state;
    const [year, setYear] = useState(selectedYear);
    const [month, setMonth] = useState(selectedMonth);
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
                        checkState: workType.workStatus || "",
                        checkMemo: workType.checkMemo || "",
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
            case "미제출":
                alert("아직 근무표를 제출하지 않은 사원입니다.");
                return;
            case "수정 요청":
                alert("아직 근무표를 재수정하지 않았습니다.");
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
                alert("체크된 항목이 없습니다.");
                return;
            }

            const missingMemo = checkedItemsData.some((item) => !item.checkStateMemo || item.checkStateMemo.trim() === "");
            if (missingMemo) {
                alert("사유를 입력하지 않은 항목이 있습니다.");
                return;
            }
            try {
                const axiosInstance = createAxiosInstance();
                await axiosInstance.post(`/workScheduleAdmin/${id}`,{
                    year,
                    month,
                    checkedDatesDto: checkedItemsData
                });
                alert(id + "의 수정요청이 완료되었습니다.");
                localStorage.removeItem("checkedItems");
                setCheckedItems({});
                setDisplayText("수정 요청")
            } catch (error) {
                // console.error(error);
                alert("저장 중 오류가 발생했습니다.");
            }
        } else {
            try {
                const axiosInstance = createAxiosInstance();
                await axiosInstance.post(`/workScheduleAdmin/approval/${id}`,{
                    year,
                    month,
                    checkedDatesDto: null,
                    keyData
                });
                alert(id + "의 승인이 완료되었습니다.");
                setDisplayText("승인 완료")
            } catch (error) {
                // console.error(error);
                alert("저장 중 오류가 발생했습니다.");
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
                {loading ? "Loading ...":<div className="d-flex justify-content-center align-items-center mb-2">
                    <button type="button" className="btn btn-secondary me-3" onClick={handleClickReceipt}>
                        {month}월 영수증 첨부
                    </button>
                    <button onClick={() => handleSave(0)} className="btn btn-secondary me-4" type="button">수정 요청</button>
                    {role === "ROLE_ADMIN" ?
                        <button onClick={() => handleSave(1)} className="btn btn-secondary me-4" type="button">승 인</button>
                        :
                        role === "ROLE_TEAM_LEADER" ?
                            <button onClick={() => handleSave(2)} className="btn btn-secondary me-4" type="button">승인 요청</button>
                            :
                            <button onClick={() => handleSave(3)} className="btn btn-secondary me-4" type="button">승인 요청</button>
                    }
                    <h5 className="">상태 : {displayText} </h5>
                </div>}
                <div
                    className="table-responsive"
                    style={{ maxHeight: "700px", overflowY: "auto", border: "1px solid #ddd" }}
                >
                    <table className="table table-striped">
                        <thead className="table-light sticky-top" style={{ top: "0", zIndex: 1 }}>
                        <tr>
                            <th className="text-center">수정 사항</th>
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
                        {loading ? null : schedule.map((day, index) => (
                            <tr key={index} onClick={() => handleClickEdit(day.key)}>
                                {day.workType ? <td className={day.styleClass}
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
                                            placeholder="사유 입력"
                                            value={checkedItems[day.key]?.checkStateMemo || ""}
                                            onChange={(e) => handleMemoChange(day.key, e.target.value)}
                                            style={{marginLeft: "8px", width: "150px"}}
                                        />
                                    )}
                                </td> :
                                    <td className={day.styleClass}>

                                    </td>}
                                <td className={day.styleClass}>
                                    {day.date}日
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
                                    style={{ maxWidth: "300px" , minWidth: "200px"}}>
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
export default AdminWorkScheduleList;