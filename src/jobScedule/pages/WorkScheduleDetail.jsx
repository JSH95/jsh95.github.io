import React, {useCallback, useEffect, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import useWorkData from "../utils/WorkData";
import createAxiosInstance from "../../config/api";
import workDataDefault from "../utils/WorkDataDefault";

function WorkScheduleDashboard (){
    const location = useLocation();
    const fromState = location.state || {};

    const { date } = useParams();
    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth()+ 1;
    const navigate = useNavigate();
    const [item, setItem] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("")
    const [isEditing, setIsEditing] = useState(!!fromState.isEditing);
    const [editedItem, setEditedItem] = useState({});
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [progress, setProgress] = useState(0); // 업로드 진행 상태
    const workData = useWorkData(year, month); // ✅ 최상위에서 호출
    const data = workDataDefault();
    const [defaultItem] = useState({
        id: "",
        checkInDate: date,
        checkInTime: "",
        checkOutDate: date,
        checkOutTime: "",
        breakTimeIn: "",
        breakTimeOut: "",
        workType: "",
        workPosition: "",
        workLocation: "",
        memo: "",
        flexTime: false,
        });



    const dataLoading = async () => {
        setLoading(true);
        if (workData.workData[date]) {
            setItem(workData.workData[date]);
            setEditedItem(workData.workData[date]);
        } else {
            const newDefaultItem = {
                ...defaultItem,
                checkInTime: data.checkInTime || "",
                checkOutTime: data.checkOutTime|| "",
                breakTimeIn: data.breakTimeIn|| "",
                breakTimeOut: data.breakTimeOut|| "",
                workLocation: data.workLocation|| "",
                workPosition: data.workPosition|| "",
                flexTime: data.flexTime|| false,
            };
            setItem(null);
            setEditedItem(newDefaultItem);
        }
    }
    useEffect(() => {
        dataLoading().then(r => {
            setLoading(false);
        });
    }, [data, workData?.workData[date]]);

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
        setEditedItem((prevItem) => ({
            ...prevItem,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // 폼 제출 방지
        const confirmSave = window.confirm("해당 근무표 정보를 저장하시겠습니까?");
        if (!confirmSave) {
            return;
        } else {
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
                const axiosInstance = createAxiosInstance(); // 인스턴스 생성
                await axiosInstance.post(
                    "/workSchedule/save",
                    editedItem
                );
                setItem(editedItem);
                setEditedItem(editedItem);
                setIsEditing(false);
                window.alert("근무표 정보를 저장하였습니다");
                navigate("/workSchedule/list")
            } catch (err) {
                setError(err.response?.status === 404 ? "입력된 값을 다시 한번 확인해 주세요" : "근무표 정보를 수정하는 데 실패했습니다.");
            }finally {
                setLoading(false);
            }
        }
    };

    const handleDeleteClick = async (e) =>{
        e.preventDefault();
        const confirmDelete = window.confirm("해당 근무표 정보를 삭제하시겠습니까?");
        if (!confirmDelete) {
            return;
        } else {
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
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const allowedExtensions = ["jpg", "jpeg", "png"];
        const fileExtension = file.name.split(".").pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            alert("JPG 또는 PNG 파일만 업로드할 수 있습니다.");
            e.target.value = ""; // 선택된 파일 초기화
            return;
        }
        setSelectedFile(file);
    };

    const handleClickDelete = async (id, name) => {
        const confirmDelete = window.confirm(`지연표_${name.split("_").pop()}을(를) 삭제하시겠습니까?`);
        if (!confirmDelete) return;
        try {
            const axiosInstance = createAxiosInstance();
            await axiosInstance.delete(`/workSchedule/file/delete/${id}`);
            window.alert("지연표를 삭제하였습니다.");
            dataLoging();
        } catch (error) {
            // console.error("지연표 삭제 실패:", error);
            alert("지연표 삭제 중 오류가 발생했습니다. \n 다시 시도해 주세요.");
        }
    }

        const handleUpload = async () => {
            if(selectedFile === null) {
                window.alert("파일을 선택해주세요.");
                return;
            }
            if(item?.fileId) {
                const confirmDelete = window.confirm("이미 업로드한 파일이 있습니다. 재업로드 하시겠습니까?");
                if (!confirmDelete) return;
            }
            setUploading(true);
            setProgress(0); // 초기화
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
                        const currentTime = Date.now();
                        if (currentTime - lastUpdateTime > delay) {
                            setProgress(percentCompleted);
                            lastUpdateTime = currentTime; // 마지막 업데이트 시간을 기록
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
            }
        };


    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;
    return (
        <div className="container d-flex justify-content-center align-items-center flex-column">
            <div className="card" style={{ width: '100%', maxWidth: '600px', minHeight: '500px' }}>
                <form onSubmit={handleSubmit}>
                <div className="card-header">
                    <h3>근무표 상세 페이지</h3>
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
                                <div className="d-flex align-items-center justify-content-start gap-2 flex-nowrap">
                                    <input
                                        name="checkInDate"
                                        type="date"
                                        className="form-control"
                                        style={{ maxWidth: "160px" }}
                                        value={editedItem.checkInDate || ""}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        type="number"
                                        min="00"
                                        max="99"
                                        className="form-control"
                                        placeholder="시"
                                        style={{ width: "80px" }}
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
                                    />
                                    <span className="fs-5">:</span>
                                    <input
                                        type="number"
                                        min="00"
                                        max="59"
                                        className="form-control"
                                        placeholder="분"
                                        style={{ width: "80px" }}
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
                            <div className="form-group">
                                <label className="label">퇴근 날짜 / 시간</label>
                                <div className="d-flex align-items-center justify-content-start gap-2 flex-nowrap">
                                    <input
                                        name="checkOutDate"
                                        type="date"
                                        className="form-control"
                                        style={{ maxWidth: "160px" }}
                                        value={editedItem.checkOutDate || ""}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="99"
                                        className="form-control"
                                        placeholder="시"
                                        style={{ width: "80px" }}
                                        value={editedItem.checkOutHour ?? (editedItem.checkOutTime?.split(":")[0] || "")}
                                        onChange={(e) => {
                                            const hour = e.target.value;
                                            const minute = editedItem.checkOutMinute ?? editedItem.checkOutTime?.split(":")[1] ?? "00";
                                            const checkOutDate = parseInt(hour) >= 24
                                                ? new Date(new Date(editedItem.checkInDate).getTime() + 86400000).toISOString().split("T")[0]
                                                : editedItem.checkInDate;

                                            setEditedItem((prev) => ({
                                                ...prev,
                                                checkOutHour: hour,
                                                checkOutDate: checkOutDate,
                                                checkOutTime: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`,
                                            }));
                                        }}
                                    />
                                    <span className="fs-5">:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        className="form-control"
                                        placeholder="분"
                                        style={{ width: "80px" }}
                                        value={editedItem.checkOutMinute ?? (editedItem.checkOutTime?.split(":")[1] || "")}
                                        onChange={(e) => {
                                            const minute = e.target.value;
                                            const hour = editedItem.checkOutHour ?? editedItem.checkOutTime?.split(":")[0] ?? "00";
                                            const checkOutDate = parseInt(hour) >= 24
                                                ? new Date(new Date(editedItem.checkInDate).getTime() + 86400000).toISOString().split("T")[0]
                                                : editedItem.checkInDate;
                                            setEditedItem((prev) => ({
                                                ...prev,
                                                checkOutMinute: minute,
                                                checkOutDate: checkOutDate,
                                                checkOutTime: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`,
                                            }));
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">휴게시간</label>
                                <div className="d-flex">
                                    <input
                                        name="breakTimeIn"
                                        type="time"
                                        className="input"
                                        value={editedItem.breakTimeIn  || ""}
                                        onChange={handleInputChange}
                                    />
                                    <span> ~ </span>
                                    <input
                                        name="breakTimeOut"
                                        type="time"
                                        className="input"
                                        value={editedItem.breakTimeOut  || ""}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
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
                            {item?.memo || editedItem.workType !== "출근" && editedItem.workType !== "휴일출근"
                                || (!editedItem.flexTime && editedItem.checkInTime > data.checkInTime)
                            || (
                                editedItem.workType === "출근" &&
                                editedItem.checkInDate !== editedItem.checkOutDate &&
                                parseInt(editedItem.checkOutHour || editedItem.checkOutTime?.split(":")[0] || 0) < 24
                            ) ? (
                                <div className="form-group">
                                    <label>사유</label>
                                    <textarea
                                        name="memo"
                                        // type="text"
                                        className="input"
                                        placeholder="사유를 입력해 주세요."
                                        value={editedItem.memo  || ""}
                                        onChange={handleInputChange}
                                        required={editedItem.flexTime}
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
                            {(!editedItem.flexTime && editedItem.checkInTime > data.checkInTime) ? ( // 체크인 시간이 다르면 표시
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
                                        <div className="d-flex gap-2 mb-3" style={{ width: '80%' }}>
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
                                    <div className="d-flex justify-content-center align-items-center">
                                        <span className="form-control-plaintext me-2">
                                          {item?.checkInTime || defaultItem.checkInTime}
                                        </span>
                                        <span className="text-gray-500 me-2 fs-5"> ~ </span>
                                        <span className="form-control-plaintext">
                                          {item?.checkOutDate !== item?.checkInDate ? "次の日 " + item?.checkOutTime : item?.checkOutTime || ""}
                                        </span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="label">휴게시간</label>
                                    <div className="d-flex justify-content-center align-items-center">
                                        <span className="form-control-plaintext me-2">
                                          {item?.breakTimeIn || defaultItem.breakTimeIn}
                                        </span>
                                        <span className="text-gray-500 me-2 fs-5"> ~ </span>
                                        <span className="form-control-plaintext">
                                          {item?.breakTimeOut || defaultItem.breakTimeOut}
                                        </span>
                                    </div>
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
                                            <a href={item?.fileUrl} target="_blank" rel="noreferrer">
                                                {item?.fileName.split("_").pop()}
                                            </a>
                                            &nbsp;
                                            <i
                                                className="bi bi-trash-fill"
                                                onClick={() => handleClickDelete(item?.fileId, item?.fileName)}
                                            ></i>
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        {!item?.flexTime && item?.checkInTime !== data.checkInTime && (
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

                        {isEditing || workData.workData[date]?.workStatus === "신청중" ? (<></>) : (
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