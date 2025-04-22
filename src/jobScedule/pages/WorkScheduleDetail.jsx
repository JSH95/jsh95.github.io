import React, {useCallback, useEffect, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import useWorkData from "../utils/WorkData";
import createAxiosInstance from "../../config/api";
import workDataDefault from "../utils/WorkDataDefault";
import {adjustTime} from "../utils/timeUtils";
import {useLoading} from "../../utils/LoadingContext";

function WorkScheduleDashboard (){
    const { setIsProcessing } = useLoading();
    const location = useLocation();
    const fromState = location.state || {};

    const { date } = useParams();
    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth()+ 1;
    const navigate = useNavigate();
    const { workData, fetchWorkData, loading: dataLoading, error: dataError } = useWorkData(
        year,
        month
    );

    const [item, setItem] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("")
    const [isEditing, setIsEditing] = useState(!!fromState.isEditing);
    const [editedItem, setEditedItem] = useState({});
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [progress, setProgress] = useState(0); // 업로드 진행 상태
    const data = workDataDefault();
    const [noBreakTime, setNoBreakTime] = useState(false)
    const [fullBreaktime, setFullBreaktime] = useState(
        item?.workType === "유급휴가" && item?.workPosition === "휴가"
    );
    const defaultItem = {
        id: "",
        checkInDate: date,
        checkInTime: "",
        checkOutDate: date,
        checkOutTime: "",
        // breakTimeIn: "",
        // breakTimeOut: "",
        breakTime: 0,
        workType: "",
        workPosition: "",
        workLocation: "",
        memo: "",
        flexTime: false,
        };

    useEffect(() => {
        if (workData?.[date]) {
            setItem(workData[date]);
            setEditedItem(workData[date]);
            setNoBreakTime(Number(workData[date].breakTime) === 0);
        } else {
            setItem(null);
            setEditedItem({
                ...defaultItem,
                checkInTime: data.checkInTime || "",
                checkOutTime: data.checkOutTime || "",
                breakTime: data.breakTime || "",
                workLocation: data.workLocation || "",
                workPosition: data.workPosition || "",
                flexTime: data.flexTime || false,
            });
        }
    }, [workData, data]);

    useEffect(() => {
        fetchWorkData();
    }, [year, month, fetchWorkData]);

    function handleClickBack() {
        navigate("/workSchedule/list");
    }
    const handleEditClick = () => {
        setIsEditing(true);
    };
    function handleCancelClick() {
        if (!item || Object.keys(item).length === 0) {
            navigate("/workSchedule/list");
        } else {
            setIsEditing(false);
            setEditedItem(item);
        }
    }
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setEditedItem((prevItem) => {
            const updated = { ...prevItem, [name]: value };

            // workType이 변경된 경우만 체크인/체크아웃 시간 자동 설정
            if (name === "workType") {
                if (value !== "출근" && value !== "휴일출근" && value !== "유급휴가") {
                    updated.checkInTime = "00:00";
                    updated.checkOutTime = "00:00";
                } else {
                    updated.checkInTime = data?.checkInTime || item?.checkInTime || "09:00";
                    updated.checkOutTime = data?.checkOutTime || item?.checkOutTime || "18:00";
                }
            }

            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // 폼 제출 방지
        if (!window.confirm("해당 근무표 정보를 저장하시겠습니까?")) return;

        setLoading(true);
        setError("");
            try {
                if(editedItem.workType !== "유급휴가" && editedItem.workType !== "출근" && editedItem.workType !== "휴일출근"){
                    editedItem.workPosition = "휴가";
                }
                if(!(editedItem.workType !== "출근" && editedItem.workType !== "휴일출근"
                    || editedItem.checkInTime > data.checkInTime
                    || editedItem.checkInDate !== editedItem.checkOutDate)){
                    editedItem.memo = "";
                }
                const adjusted = adjustTime(editedItem.checkOutTime);
                const toSave = {
                    ...editedItem,
                    checkOutTime: adjusted.time,
                    breakTime: noBreakTime ? 0 : editedItem.breakTime,
                };

                const axiosInstance = createAxiosInstance(); // 인스턴스 생성
                await axiosInstance.post("/workSchedule/save", toSave);

                setItem(toSave);
                setEditedItem(toSave);
                setIsEditing(false);
                window.alert("근무표 정보를 저장하였습니다");
                await fetchWorkData();
            } catch (err) {
                setError(err.response?.status === 404
                    ? "입력된 값을 다시 한번 확인해 주세요"
                    : "근무표 정보를 수정하는 데 실패했습니다.");
            }finally {
                setLoading(false);
            }
    };

    const handleDeleteClick = async (e) =>{
        e.preventDefault();
        if (!window.confirm("해당 근무표 정보를 삭제하시겠습니까?")) return;

        setIsProcessing(true);
            setLoading(true);
            setError("");
                try{
                    const axiosInstance = createAxiosInstance(); // 인스턴스 생성
                    await axiosInstance.delete(`/workSchedule/delete/${editedItem.id}/${item.fileId? item.fileId : "0"}`);
                    window.alert("근무표 정보를 삭제하였습니다");
                    navigate("/workSchedule/list");
                }catch (err){
                    setError("근무표 정보를 삭제하는 데 실패했습니다. 다시 시도해 주세요." + err.message);
                } finally {
                setLoading(false);
                setIsProcessing(false);
            }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fileExtension = file.name.split(".").pop().toLowerCase();
        if (!["jpg", "jpeg", "png"].includes(fileExtension)) {
            alert("JPG 또는 PNG 파일만 업로드할 수 있습니다.");
            e.target.value = ""; // 선택된 파일 초기화
            return;
        }
        setSelectedFile(file);
    };

    const handleClickDelete = async (id, name) => {
        if (!window.confirm(`지연표_${name.split("_").pop()}을(를) 삭제하시겠습니까?`)) return;
        setIsProcessing(true);
        try {
            const axiosInstance = createAxiosInstance();
            await axiosInstance.delete(`/workSchedule/file/delete/${id}`);
            window.alert("지연표를 삭제하였습니다.");
            const updated = { ...item, fileId: null, fileName: null, fileUrl: null };
            setItem(updated);
            setEditedItem(updated);
            await fetchWorkData();
        } catch (error) {
            // console.error("지연표 삭제 실패:", error);
            alert("지연표 삭제 중 오류가 발생했습니다. \n 다시 시도해 주세요.");
        } finally {
            setIsProcessing(false);
        }
    }

        const handleUpload = async () => {
            if (!selectedFile) return window.alert("파일을 선택해주세요.");
            if (item?.fileId && !window.confirm("이미 업로드한 파일이 있습니다. 재업로드 하시겠습니까?")) return;

            setUploading(true);
            setProgress(0); // 초기화
            setIsProcessing(true);
            try {
                let lastUpdateTime = 0;
                const delay = 100; // 업데이트 간격 (ms)

                const formData = new FormData();
                formData.append("file", selectedFile);
                formData.append("date", date);
                formData.append("type", 0);
                const axiosInstance = createAxiosInstance();
                await axiosInstance.post("/workSchedule/file/upload",formData,{
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        const now = Date.now();
                        if (now - lastUpdateTime > delay) {
                            setProgress(percentCompleted > 95 ? 95 : percentCompleted);
                            lastUpdateTime = now;
                            }
                        },
                });
                setProgress(100);
                window.alert("파일 업로드 성공!");

                localStorage.setItem("fileStatus", JSON.stringify(true));
                localStorage.setItem("selectedFile", JSON.stringify(selectedFile));
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    window.alert(error.response.data);
                    localStorage.setItem("fileStatus", JSON.stringify(false));
                } else {
                    window.alert("파일 업로드 중 오류가 발생했습니다.");
                    localStorage.setItem("fileStatus", JSON.stringify(false));
                }
            }finally {
                setProgress(0);
                setUploading(false);
                setIsProcessing(false);
            }
        };

    const handleFullBreaktimeChange = (e) => {
        const isChecked = e.target.checked;
        setFullBreaktime(isChecked);

        setEditedItem((prev) => ({
            ...prev,
            checkInTime: isChecked ? "00:00" : data.checkInTime,
            checkOutTime: isChecked ? "00:00" : data.checkOutTime,
            workPosition: isChecked ? "휴가" : data.workPosition,
        }));
    };

    useEffect(() => {
        if (item?.workType === "유급휴가" && item?.workPosition === "휴가"
            && item.checkInTime === "00:00" && item.checkOutTime === "00:00"
            && item.checkInDate === item.checkOutDate) {
            setFullBreaktime(true);
        }
    }, [item]);

    return (
        <div className="container d-flex justify-content-center align-items-center flex-column">
            <div className="card" style={{ width: '100%', maxWidth: '600px', minHeight: '500px' }}>
                <form onSubmit={handleSubmit}>
                <div className="card-header">
                    <h3>근무표 상세 페이지</h3>
                    {dataError ? {dataError}  : null}
                </div>
                <div className="card-body">
                    {isEditing ? (
                        <>
                            <div>
                                <input
                                    className="form-control mb-2"
                                    name="id"
                                    value={editedItem?.id  || ""}
                                    onChange={handleInputChange}
                                    disabled
                                    hidden
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">출근 날짜 / 시간</label>
                                <div className="d-flex align-items-center justify-content-start gap-2">
                                    <input
                                        name="checkInDate"
                                        type="date"
                                        className="form-control"
                                        style={{ maxWidth: "150px" , minWidth: 0}}
                                        value={editedItem.checkInDate || ""}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        type="number"
                                        min="00"
                                        max="23"
                                        className="form-control"
                                        placeholder="시"
                                        style={{ width: "80px" , minWidth: 0}}
                                        value={editedItem.checkInHour ?? (editedItem.checkInTime?.split(":")[0] || "")}
                                        onChange={(e) => {
                                            const hour = e.target.value;
                                            const minute = editedItem.checkInMinute ?? editedItem.checkInTime?.split(":")[1] ?? "00";
                                            setEditedItem((prev) => ({
                                                ...prev,
                                                checkInHour: hour,
                                                checkInTime: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`,
                                            }));
                                        }}
                                        required
                                    />
                                    <span className="fs-5">:</span>
                                    <input
                                        type="number"
                                        min="00"
                                        max="59"
                                        className="form-control"
                                        placeholder="분"
                                        style={{ width: "80px" , minWidth: 0}}
                                        value={editedItem.checkInMinute ?? (editedItem.checkInTime?.split(":")[1] || "")}
                                        onChange={(e) => {
                                            const minute = e.target.value;
                                            const hour = editedItem.checkInHour ?? editedItem.checkInTime?.split(":")[0] ?? "00";
                                            setEditedItem((prev) => ({
                                                ...prev,
                                                checkInMinute: minute,
                                                checkInTime: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`,
                                            }));
                                        }}
                                        required
                                    />
                                </div>
                            </div>


                            <div className="form-group">
                                <label className="label">퇴근 날짜 / 시간</label>
                                <div className="d-flex align-items-center justify-content-start gap-2 ">
                                    <input
                                        name="checkOutDate"
                                        type="date"
                                        className="form-control"
                                        style={{ maxWidth: "150px" , minWidth: 0}}
                                        value={editedItem.checkOutDate || ""}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="99"
                                        className="form-control"
                                        placeholder="시"
                                        style={{ width: "80px" , minWidth: 0}}
                                        value={editedItem.checkOutHour ?? (editedItem.checkOutTime?.split(":")[0] || "")}
                                        onChange={(e) => {
                                            const hour = e.target.value;
                                            const minute = editedItem.checkOutMinute ?? editedItem.checkOutTime?.split(":")[1] ?? "00";
                                            const checkOutDate = parseInt(hour) >= 24
                                                ? new Date(new Date(editedItem.checkInDate).getTime() + 86400000).toISOString().split("T")[0]
                                                : editedItem.checkOutDate;

                                            setEditedItem((prev) => ({
                                                ...prev,
                                                checkOutHour: hour,
                                                checkOutDate: checkOutDate,
                                                checkOutTime: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`,
                                            }));
                                        }}
                                        required
                                    />
                                    <span className="fs-5">:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        className="form-control"
                                        placeholder="분"
                                        style={{ width: "80px" , minWidth: 0}}
                                        value={editedItem.checkOutMinute ?? (editedItem.checkOutTime?.split(":")[1] || "")}
                                        onChange={(e) => {
                                            const minute = e.target.value;
                                            const hour = editedItem.checkOutHour ?? editedItem.checkOutTime?.split(":")[0] ?? "00";
                                            setEditedItem((prev) => ({
                                                ...prev,
                                                checkOutMinute: minute,
                                                checkOutTime: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`,
                                            }));
                                        }}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group row">
                                <div className="row">
                                    <div className="col">
                                        <strong className="col">플랙스 시간제</strong>
                                    </div>
                                    <div className="col">
                                        <input
                                            type="checkbox"
                                            name="flexTime"
                                            style={{marginTop: "0px"}}
                                            className="form-check-input"
                                            checked={editedItem.flexTime}
                                            onChange={(e) => {
                                                setEditedItem({
                                                    ...editedItem,
                                                    flexTime: e.target.checked,
                                                });
                                            }
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group row">
                                <div className="row">
                                    {/*handleFullBreaktimeChange*/}
                                    <div className="col">
                                        <strong className="col">휴게시간 없음</strong>
                                    </div>
                                    <div className="col">
                                        <input
                                            type="checkbox"
                                            name="noBreakTime"
                                            style={{marginTop: "0px"}}
                                            className="form-check-input"
                                            checked={noBreakTime}
                                            onChange={(e) => {
                                                setNoBreakTime(e.target.checked);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {noBreakTime? null
                                :
                                <div className="form-group">
                                    <label className="label">휴게시간(분)</label>
                                    <div className="d-flex">
                                        <input
                                            name="breakTime"
                                            type="number"
                                            className="input"
                                            min="0"
                                            max="240"
                                            value={editedItem.breakTime}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            }

                            <div className="form-group">
                                <label className="label">근무 유형</label>
                                <select
                                    className="form-control"
                                    name="workType"
                                    value={editedItem.workType  || ""}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="" disabled>
                                        해당하는 근무 유형를 선택해 주세요.
                                    </option>
                                    <option value="출근">출근</option>
                                    <option value="결근">결근</option>
                                    <option value="유급휴가">유급휴가</option>
                                    <option value="대휴">대휴</option>
                                    <option value="특별휴가">특별휴가</option>
                                    <option value="휴일대체">휴일대체</option>
                                    <option value="경조휴가">경조휴가</option>
                                    <option value="휴일출근">휴일출근</option>
                                </select>
                            </div>
                            {editedItem?.workType ==="유급휴가" ?
                                <div className="form-group row">
                                    <div className="row">
                                        <div className="col">
                                            <strong className="col">전휴</strong>
                                        </div>
                                        <div className="col">
                                            <input
                                                type="checkbox"
                                                name="fullBreaktimeCheck"
                                                style={{marginTop: "0px"}}
                                                className="form-check-input"
                                                checked={fullBreaktime}
                                                onChange={handleFullBreaktimeChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                : null}
                            {item?.memo || editedItem.workType !== "출근" && editedItem.workType !== "휴일출근"
                                || (!editedItem.flexTime && editedItem.checkInTime > data.checkInTime)
                                ? (
                                <div className="form-group">
                                    <label>사유</label>
                                    <textarea
                                        name="memo"
                                        // type="text"
                                        className="input"
                                        placeholder="사유를 입력해 주세요."
                                        value={editedItem.memo  || ""}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            ) : (
                                    <>
                                        <input
                                            name="memo"
                                            type="text"
                                            className="input"
                                            value={editedItem.memo? editedItem.memo : ""}
                                            onChange={handleInputChange}
                                            hidden
                                            disabled
                                        />
                                    </>
                            )}
                                    {editedItem.workType !== "유급휴가" && editedItem.workType !== "출근" && editedItem.workType !== "휴일출근"? (
                                        <></>
                                            ) : (
                                        <div className="form-group">
                                            <label className="label">근태 유형</label>
                                            <select
                                                name="workPosition"
                                                className="form-control"
                                                value={editedItem.workPosition || ""}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <><option value="" disabled>
                                                    해당하는 근태 유형를 선택해 주세요.
                                                </option>
                                                    <option value="현장">현장</option>
                                                    <option value="본사">본사</option>
                                                    <option value="재택근무">재택근무</option>
                                                    <option value="휴가">휴가</option>
                                                </>
                                            </select>
                                        </div>
                                    )}
                            <div className="form-group">
                                <label className="label">근무지</label>
                                <input
                                    name="workLocation"
                                    type="text"
                                    className="input"
                                    value={editedItem.workLocation || ""}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {((editedItem.workType === "출근" && editedItem.workType !== "유급휴가") && !editedItem.flexTime && editedItem.checkInTime > data.checkInTime) ? ( // 체크인 시간이 다르면 표시
                                <>
                                    <label className="label">지연표를 업로드 해주세요</label>
                                    <div className="row-cols-1">
                                        {uploading && (
                                            <div style={{ marginBottom: "10px" }}>
                                                <p>업로드 진행 중: {progress}%</p>
                                                <div
                                                    style={{
                                                        // width: "100%",
                                                        backgroundColor: "#e0e0e0",
                                                        borderRadius: "5px",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: `${progress}%`,
                                                            backgroundColor: "#4caf50",
                                                            height: "10px",
                                                            borderRadius: "5px",
                                                            transition: "width 0.5s ease-in-out"
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="d-flex align-items-center gap-2 mb-2 my-2 justify-content-start">
                                            <strong>
                                                <label className="label">.jpg, .png타입만 업로드 가능</label>
                                            </strong>
                                        </div>
                                        <div className="d-flex gap-2 mb-3"
                                            style={{ width: '100%', maxWidth: '100%' }}
                                        >
                                            <div className="input-group">
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    accept="image/jpeg, image/png"
                                                    onChange={handleFileChange}
                                                    placeholder="지연표 업로드"
                                                    style={{ width: '70%' }}
                                                />
                                                <button onClick={handleUpload}
                                                        className="btn btn-primary"
                                                        type="button">
                                                    업로드
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>

                            ) : null}
                        </>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label className="label">출퇴근 시간</label>
                                    {!(item?.checkInTime === "00:00" && item?.checkOutTime === "00:00" && item?.checkInDate === item?.checkOutDate) ?
                                        <div className="d-flex justify-content-center align-items-center">
                                            <span className="form-control-plaintext me-2">
                                              {item?.checkInTime || defaultItem.checkInTime}
                                            </span>
                                            <span className="text-gray-500 me-2 fs-5"> ~ </span>
                                            <span className="form-control-plaintext">
                                              {item?.checkOutDate !== item?.checkInDate ? "次の日 " + item?.checkOutTime : item?.checkOutTime || ""}
                                            </span>
                                        </div>
                                        :
                                        "-"
                                        }
                                </div>

                                <div className="form-group">
                                    <label className="label">휴게시간(분)</label>
                                    {!(item?.checkInTime === "00:00" && item?.checkOutTime === "00:00" && item?.checkInDate === item?.checkOutDate) ?
                                    <div className="d-flex justify-content-center align-items-center">
                                        <span className="form-control-plaintext me-2">
                                          {
                                              noBreakTime
                                                  ? "휴게 시간 없음"
                                                  : item?.breakTime !== undefined && item?.breakTime !== null
                                                      ? item.breakTime + "분"
                                                      : ""
                                          }
                                        </span>
                                    </div>
                                        : "-"
                                    }
                                </div>
                                <div className="form-group">
                                    <label className="label">근무 유형</label>
                                    <span className="form-control-plaintext">
                                        {item?.workType || defaultItem.workType}
                                      </span>
                                </div>
                                <div className="form-group">
                                    <label className="label">근태 유형</label>
                                    <span className="form-control-plaintext">
                                        {item?.workPosition || defaultItem.workPosition}
                                    </span>
                                </div>
                                <div className="form-group">
                                    <label className="label">근무지</label>
                                    <span className="form-control-plaintext">
                                        {item?.workLocation || defaultItem.workLocation}
                                    </span>
                                </div>
                                {item?.memo && (
                                    <div className="form-group">
                                        <label>사유</label>
                                        <span className="form-control-plaintext">
                                            {item?.memo || defaultItem.checkInTime}
                                        </span>
                                    </div>
                                )}
                                { item?.fileId ? (
                                    <div className="form-group">
                                        <label>지연표 업로드 내역</label>
                                        <span>
                                            <a href={item?.fileUrl}
                                               rel="noreferrer"
                                               className="me-3"
                                               target="_blank"
                                            >
                                                {item?.fileName.split("_").pop()}
                                            </a>
                                            <i
                                                className="bi bi-trash-fill"
                                                onClick={() => handleClickDelete(item?.fileId, item?.fileName)}
                                                style={{ cursor: "pointer", transition: "color 0.2s ease-in-out" }}
                                            ></i>
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        {editedItem.workType !== "출근" && editedItem.workType !== "유급휴가" && !item?.flexTime && item?.checkInTime !== data.checkInTime && (
                                            <label>지연표를 업로드 해주세요</label>
                                        )}
                                    </>
                                )}
                            </>
                    )}
                </div>
                <div className="card-footer">
                    <div className="d-flex justify-content-between w-100">
                        {isEditing ? (
                            <button
                                type="button"
                                className="btn btn-secondary me-4"
                                onClick={handleCancelClick}
                            >
                                취소
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-secondary me-3"
                                onClick={handleClickBack}
                            >
                                돌아가기
                            </button>
                        )}

                        {isEditing ? (
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                저장
                            </button>
                        ) : (<></>)}

                        {isEditing || workData[date]?.workStatus === "신청중" ? (<></>) : (
                            <button
                                type="button"
                                className="btn btn-primary me-4"
                                onClick={handleEditClick}
                            >
                                수정하기
                            </button>
                        )}
                        {item && !isEditing ? (<button
                                type="button"
                                className="btn btn-danger "
                                onClick={handleDeleteClick}
                            >
                                삭제
                            </button>
                        ) : (<></>)}
                    </div>
                </div>
                </form>
            </div>
</div>
    );
}
export default WorkScheduleDashboard;