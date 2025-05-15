import React, {useEffect, useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import useWorkData from "../utils/WorkData";
import createAxiosInstance from "../../config/api";
import workDataDefault from "../utils/WorkDataDefault";
import {adjustTime} from "../utils/timeUtils";
import {useLoading} from "../../utils/LoadingContext";

function WorkScheduleDashboard (){
    const { setIsProcessing } = useLoading();
    const { date } = useParams();
    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth()+ 1;
    const navigate = useNavigate();
    const { workData, fetchWorkData, loading: dataLoading, error: dataError } = useWorkData(
        year,
        month
    );
    const [ leaveType, setLeaveType ] = useState(""); // 초기값 없음
    const [ item, setItem ] = useState({});
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState("");
    const [ isEditing, setIsEditing ] = useState(localStorage.getItem("fileStatus") === "true");
    const [ editedItem, setEditedItem ] = useState({});
    const [ uploading, setUploading ] = useState(false);
    const [ selectedFile, setSelectedFile ] = useState(null);
    const [ progress, setProgress ] = useState(0);
    const data = workDataDefault();
    const [ noBreakTime, setNoBreakTime ] = useState(false);
    const dayData = workData?.[date];
    console.log(editedItem)
    const defaultItem = {
        id: "",
        checkInDate: date,
        checkInTime: "",
        checkOutDate: date,
        checkOutTime: "",
        breakTime: 0,
        workType: "",
        workPosition: "",
        workLocation: "",
        memo: "",
        flexTime: false,
        };

    useEffect(() => {
        fetchWorkData();
    }, [year, month, fetchWorkData]);

    useEffect(() => {

        if (dayData) {
            // 기존 데이터 있을 때
            setItem(dayData);
            setEditedItem(dayData);
            setNoBreakTime(dayData.breakTime === 0);
        } else {
            // 신규 작성 모드일 때, defaultData 값을 채워 넣는다!
            const defaults = {
                ...defaultItem,
                checkInTime: data?.checkInTime || "",
                checkOutTime: data?.checkOutTime || "",
                breakTime: data?.breakTime   || 0,
                workPosition: data?.workPosition || "",
                workLocation: data?.workLocation || "",
                flexTime: data?.flexTime || false,
            };
            setEditedItem(defaults);
            setNoBreakTime(defaults.breakTime === 0);
        }
    }, [dayData, data]);

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
                if (value !== "出勤" && value !== "休日出勤" && value !== "有給休暇") {
                    updated.checkInTime = "00:00";
                    updated.checkOutTime = "00:00";
                }else {
                    if (prevItem.workType === "有給休暇" ) {
                        setLeaveType(""); // leaveType 초기화
                        updated.checkInTime = data?.checkInTime || "";
                        updated.checkOutTime = data?.checkOutTime || "";
                    } else {
                        // 여기서 prevItem을 참조해야함!
                        updated.checkInTime = prevItem.checkInTime || data?.checkInTime || "";
                        updated.checkOutTime = prevItem.checkOutTime || data?.checkOutTime || "";
                    }
                }
            }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // 폼 제출 방지
        if (!window.confirm("勤務表情報を保存しますか？")) return;

        setLoading(true);
        setError("");
            try {
                if(editedItem.workType !== "有給休暇" && editedItem.workType !== "出勤" && editedItem.workType !== "休日出勤"){
                    editedItem.workPosition = "休暇";
                }
                const adjusted = adjustTime(editedItem.checkOutTime);
                const toSave = {
                    ...editedItem,
                    checkOutTime: adjusted.time,
                    breakTime: noBreakTime ? 0 : editedItem.breakTime,
                };
                console.log("toSave", toSave);
                const axiosInstance = createAxiosInstance(); // 인스턴스 생성
                const response = await axiosInstance.post("/workSchedule/save", toSave);
                setItem(response.data[0]);
                setEditedItem(response.data[0]);
                window.alert("勤務表情報を保存しました。");
                setIsEditing(false);
                localStorage.setItem("fileStatus", JSON.stringify(false));
            } catch (err) {
                setError(err.response?.status === 404
                    ? "入力された値をもう一度確認してください。"
                    : "勤務表情報の修正に失敗しました。");
            }finally {
                setLoading(false);
            }
    };

    const handleDeleteClick = async (e) =>{
        e.preventDefault();
        if (!window.confirm("勤務表情報を削除しますか？")) return;

        setIsProcessing(true);
            setLoading(true);
            setError("");
                try{
                    const axiosInstance = createAxiosInstance(); // 인스턴스 생성
                    await axiosInstance.delete(`/workSchedule/delete/${editedItem.id}/${item.fileId? item.fileId : "0"}`);
                    window.alert("勤務表情報を削除しました。");
                    navigate("/workSchedule/list");
                }catch (err){
                    setError("勤務表情報の削除に失敗しました。 \nもう一度お試しください。" + err.message);
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
            alert("JPGまたはPNGファイルのみアップロードできます。");
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
            window.alert("遅延表を削除しました。");
            const updated = { ...item, fileId: null, fileName: null, fileUrl: null };
            setItem(updated);
            setEditedItem(updated);
            await fetchWorkData();
        } catch (error) {
            // console.error("지연표 삭제 실패:", error);
            alert("遅延表の削除中にエラーが発生しました。 \n もう一度お試しください。");
        } finally {
            setIsProcessing(false);
        }
    }

        const handleUpload = async () => {
            if (!selectedFile) return window.alert("ファイルを選択してください。");
            if (item?.fileId && !window.confirm("すでにアップロードしたファイルがあります。 再アップロードしますか？")) return;

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
                window.alert("ファイルアップロード完了！");
                localStorage.setItem("fileStatus", JSON.stringify(true));
                localStorage.setItem("selectedFile", JSON.stringify(selectedFile));
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    window.alert(error.response.data);
                    localStorage.setItem("fileStatus", JSON.stringify(false));
                } else {
                    window.alert("ファイルのアップロード中にエラーが発生しました。");
                    localStorage.setItem("fileStatus", JSON.stringify(false));
                }

            }finally {
                setProgress(0);
                setUploading(false);
                setIsProcessing(false);
            }
        };

    const handleLeaveTypeChange = (e) => {
        const selectedType = e.target.value;
        setLeaveType(selectedType);

        setEditedItem((prev) => {
            const updated = { ...prev };

            switch (selectedType) {
                case "전휴":
                    updated.checkInTime = "00:00";
                    updated.checkOutTime = "00:00";
                    updated.workPosition = "休暇";
                    break;

                case "오후반휴":
                    updated.checkInTime = data?.checkInTime || "";
                    updated.checkOutTime = "12:00";
                    updated.workPosition = prev.workPosition || data?.workPosition || "";
                    break;

                case "오전반휴":
                    updated.checkInTime = "13:00";
                    updated.checkOutTime = data?.checkOutTime || "";
                    updated.workPosition = prev.workPosition || data?.workPosition || "";
                    break;

                default:
                    break;
            }

            return updated;
        });
    };

    useEffect(() => {
        if (
            item?.workType === "有給休暇" &&
            item?.workPosition === "休暇" &&
            item.checkInTime === "00:00" &&
            item.checkOutTime === "00:00" &&
            item.checkInDate === item.checkOutDate
        ) {
            setLeaveType("전휴"); // 체크박스 대신 라디오 선택
        } else if (
            item?.workType === "有給休暇" &&
            item.checkOutTime === "12:00"
        ) {
            setLeaveType("오후반휴");
        } else if (
            item?.workType === "有給休暇" &&
            item.checkInTime === "13:00"
        ) {
            setLeaveType("오전반휴");
        } else {
            setLeaveType(""); // 아무 것도 선택 안 된 상태
        }
    }, [item]);


    return (
        <div className="container d-flex justify-content-center align-items-center flex-column">
            <div className="card" style={{ width: '100%', maxWidth: '600px', minHeight: '500px' }}>
                <form onSubmit={handleSubmit}>
                <div className="card-header">
                    <h3>勤務表の詳細ページ</h3>
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
                                <label className="label">出勤日 / 時間</label>
                                <div className="d-flex align-items-center justify-content-start gap-2">
                                    <input
                                        name="checkInDate"
                                        type="date"
                                        className="form-control"
                                        style={{ maxWidth: "150px", minWidth: 0 }}
                                        value={editedItem.checkInDate || ""}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="23"
                                        className="form-control"
                                        placeholder="時"
                                        style={{ width: "80px", minWidth: 0 }}
                                        value={editedItem.checkInTime ? editedItem.checkInTime.split(":")[0] : ""}
                                        onChange={(e) => {
                                            const hour = e.target.value.padStart(2, "0");
                                            const minute = editedItem.checkInTime ? editedItem.checkInTime.split(":")[1] : "00";
                                            setEditedItem((prev) => ({
                                                ...prev,
                                                checkInTime: `${hour}:${minute}`,
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
                                        placeholder="分"
                                        style={{ width: "80px", minWidth: 0 }}
                                        value={editedItem.checkInTime ? editedItem.checkInTime.split(":")[1] : ""}
                                        onChange={(e) => {
                                            const minute = e.target.value.padStart(2, "0");
                                            const hour = editedItem.checkInTime ? editedItem.checkInTime.split(":")[0] : "00";
                                            setEditedItem((prev) => ({
                                                ...prev,
                                                checkInTime: `${hour}:${minute}`,
                                            }));
                                        }}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">出勤日 / 時間</label>
                                <div className="d-flex align-items-center justify-content-start gap-2">
                                    <input
                                        name="checkOutDate"
                                        type="date"
                                        className="form-control"
                                        style={{ maxWidth: "150px", minWidth: 0 }}
                                        value={editedItem.checkOutDate || ""}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="23"
                                        className="form-control"
                                        placeholder="時"
                                        style={{ width: "80px", minWidth: 0 }}
                                        value={editedItem.checkOutTime ? editedItem.checkOutTime.split(":")[0] : ""}
                                        onChange={(e) => {
                                            const hour = e.target.value.padStart(2, "0");
                                            const minute = editedItem.checkOutTime ? editedItem.checkOutTime.split(":")[1] : "00";
                                            setEditedItem((prev) => ({
                                                ...prev,
                                                checkOutTime: `${hour}:${minute}`,
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
                                        placeholder="分"
                                        style={{ width: "80px", minWidth: 0 }}
                                        value={editedItem.checkOutTime ? editedItem.checkOutTime.split(":")[1] : ""}
                                        onChange={(e) => {
                                            const minute = e.target.value.padStart(2, "0");
                                            const hour = editedItem.checkOutTime ? editedItem.checkOutTime.split(":")[0] : "00";
                                            setEditedItem((prev) => ({
                                                ...prev,
                                                checkOutTime: `${hour}:${minute}`,
                                            }));
                                        }}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group row">
                                <div className="row">
                                    <div className="col">
                                        <strong className="col">フレックスタイム制</strong>
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
                                        <strong className="col">休憩時間なし</strong>
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
                                    <label className="label">休憩時間(分)</label>
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
                                <label className="label">勤務タイプ</label>
                                <select
                                    className="form-control"
                                    name="workType"
                                    value={editedItem.workType  || ""}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="" disabled>
                                        該当する勤務タイプを選択してください。
                                    </option>
                                    <option value="出勤">出勤</option>
                                    <option value="欠勤">欠勤</option>
                                    <option value="有給休暇">有給休暇</option>
                                    <option value="代休">代休</option>
                                    <option value="特別休暇">特別休暇</option>
                                    <option value="休日代替">休日代替</option>
                                    <option value="慶弔休暇">慶弔休暇</option>
                                    <option value="休日出勤">休日出勤</option>
                                    <option value="夜勤">夜勤</option>
                                </select>
                            </div>
                            {editedItem?.workType === "有給休暇" && (
                                <div className="form-group row">
                                    <div className="row">
                                        <div className="col">
                                            <strong>勤怠タイプ</strong>
                                        </div>
                                        <div className="col">
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="fullBreak"
                                                    name="leaveType"
                                                    value="전휴"
                                                    className="form-check-input"
                                                    checked={leaveType === "전휴"}
                                                    onChange={handleLeaveTypeChange}
                                                    required
                                                />
                                                <label htmlFor="fullBreak" className="form-check-label">全休</label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="amBreak"
                                                    name="leaveType"
                                                    value="오전반휴"
                                                    className="form-check-input"
                                                    checked={leaveType === "오전반휴"}
                                                    onChange={handleLeaveTypeChange}
                                                    required
                                                />
                                                <label htmlFor="amBreak" className="form-check-label">午前 半休</label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="pmBreak"
                                                    name="leaveType"
                                                    value="오후반휴"
                                                    className="form-check-input"
                                                    checked={leaveType === "오후반휴"}
                                                    onChange={handleLeaveTypeChange}
                                                    required
                                                />
                                                <label htmlFor="pmBreak" className="form-check-label">午後 半休</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {editedItem?.memo || editedItem.workType !== "出勤" && editedItem.workType !== "休日出勤"
                                || (!editedItem.flexTime && editedItem.checkInTime > data.checkInTime)
                                ? (
                                <div className="form-group">
                                    <label>理由</label>
                                    <textarea
                                        name="memo"
                                        className="input"
                                        placeholder="理由を入力してください。"
                                        value={editedItem.memo  || ""}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            ) : (
                                    <div className="form-group">
                                        <label>理由</label>
                                        <textarea
                                            name="memo"
                                            className="input"
                                            placeholder="必要に応じて入力してください。"
                                            value={editedItem.memo  || ""}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                            )}
                                    {editedItem.workType !== "有給休暇" && editedItem.workType !== "出勤" && editedItem.workType !== "休日出勤"? (
                                        <></>
                                            ) : (
                                        <div className="form-group">
                                            <label className="label">勤怠タイプ</label>
                                            <select
                                                name="workPosition"
                                                className="form-control"
                                                value={editedItem.workPosition || ""}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <><option value="" disabled>
                                                    該当する勤怠タイプを選択してください。
                                                </option>
                                                    <option value="現場">現場</option>
                                                    <option value="本社">本社</option>
                                                    <option value="在宅勤務">在宅勤務</option>
                                                    <option value="休暇">休暇</option>
                                                </>
                                            </select>
                                        </div>
                                    )}
                            <div className="form-group">
                                <label className="label">勤務地</label>
                                <input
                                    name="workLocation"
                                    type="text"
                                    className="input"
                                    value={editedItem.workLocation || ""}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {((editedItem.workType === "出勤" && editedItem.workType !== "有給休暇") && !editedItem.flexTime && editedItem.checkInTime > data.checkInTime) ? ( // 체크인 시간이 다르면 표시
                                <>
                                    <label className="label">遅延表をアップロードしてください。</label>
                                    <div className="row-cols-1">
                                        {uploading && (
                                            <div style={{ marginBottom: "10px" }}>
                                                <p>アップロード進行中 : {progress}%</p>
                                                <div
                                                    style={{
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
                                                <label className="label">.jpg、.pngタイプのみアップロード可能</label>
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
                                                    placeholder="遅延表アップロード"
                                                    style={{ width: '70%' }}
                                                />
                                                <button onClick={handleUpload}
                                                        className="btn btn-primary"
                                                        type="button">
                                                    アップロード
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
                                    <label className="label">出退勤時間</label>
                                    {!(item?.checkInTime === "00:00" && item?.checkOutTime === "00:00" && item?.checkInDate === item?.checkOutDate) ?
                                        <div className="d-flex justify-content-center align-items-center">
                                            <span className="form-control-plaintext me-2">
                                              {item?.checkInTime || ""}
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
                                    <label className="label">休憩時間(分)</label>
                                    {!(item?.checkInTime === "00:00" && item?.checkOutTime === "00:00" && item?.checkInDate === item?.checkOutDate) ?
                                    <div className="d-flex justify-content-center align-items-center">
                                        <span className="form-control-plaintext me-2">
                                          {
                                              noBreakTime
                                                  ? "休憩時間なし"
                                                  : item?.breakTime !== undefined && item?.breakTime !== null
                                                      ? item.breakTime + "分"
                                                      : ""
                                          }
                                        </span>
                                    </div>
                                        : "-"
                                    }
                                </div>
                                <div className="form-group">
                                    <label className="label">勤務タイプ</label>
                                    <span className="form-control-plaintext">
                                        {item?.workType || ""}
                                      </span>
                                </div>
                                <div className="form-group">
                                    <label className="label">勤怠タイプ</label>
                                    <span className="form-control-plaintext">
                                        {item?.workPosition || ""}
                                    </span>
                                </div>
                                <div className="form-group">
                                    <label className="label">勤務地</label>
                                    <span className="form-control-plaintext">
                                        {item?.workLocation || ""}
                                    </span>
                                </div>
                                {item?.memo && (
                                    <div className="form-group">
                                        <label>理由</label>
                                        <span className="form-control-plaintext">
                                            {item?.memo || ""}
                                        </span>
                                    </div>
                                )}
                                { item?.fileId ? (
                                    <div className="form-group">
                                        <label>遅延表アップロード履歴</label>
                                        <span>
                                            <a href={item?.fileUrl || ""}
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
                                        {editedItem.workType !== "出勤" && editedItem.workType !== "有給休暇" && !item?.flexTime && item?.checkInTime !== data?.checkInTime && (
                                            <label>遅延表をアップロードしてください。</label>
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
                                キャンセル
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-secondary me-3"
                                onClick={handleClickBack}
                            >
                                戻る
                            </button>
                        )}

                        {isEditing ? (
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                保存
                            </button>
                        ) : (<></>)}

                        {isEditing || workData[date]?.workStatus === "申請中" ? (<></>) : (
                            <button
                                type="button"
                                className="btn btn-primary me-4"
                                onClick={handleEditClick}
                            >
                                修正
                            </button>
                        )}
                        {item && !isEditing ? (<button
                                type="button"
                                className="btn btn-danger "
                                onClick={handleDeleteClick}
                            >
                                削除
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