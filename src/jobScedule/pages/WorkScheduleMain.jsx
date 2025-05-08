import React, { useEffect, useState, useRef } from "react";
import createAxiosInstance from "../../config/api";
import useWorkDefaultData from "../utils/WorkDataDefault";
import useWorkData from "../utils/WorkData";
import { useNavigate } from "react-router-dom";
import "../../cssFiles/ScheduleMain.css";
import {adjustTime} from "../utils/timeUtils";

const WorkScheduleMain = () => {
    const today = new Date().toISOString().split("T")[0];
    const year = new Date(today).getFullYear();
    const month = new Date(today).getMonth() + 1;
    const navigate = useNavigate();

    const data = useWorkDefaultData();
    const { workData } = useWorkData(year, month); // 데이터와 갱신 함수

    const [savedData, setSavedData] = useState({
        id: "",
        checkInDate: today,
        checkInTime: "",
        checkOutDate: today,
        checkOutTime: "",
        // breakTimeIn: "",
        // breakTimeOut: "",
        noBreakTime: false,
        workType: "出勤",
        workPosition: "",
        workLocation: "",
        basicWorkTime: "",
        flexTime: false,
        memo: "",
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [progress, setProgress] = useState(0); // 업로드 진행 상태
    const [uploading, setUploading] = useState(false);
    const [fileStatus, setFileStatus ] = useState(false);


    // 기본 데이터 설정 (초기 실행)
    useEffect(() => {
        if (data.checkInTime === null) {
            window.alert("勤務表の基本情報を設定してください。\n 該当ページに移動します。");
            navigate("/workSchedule/dashBoard");
            return;
        }
        if (workData?.[today]) {
            window.alert("本日の出勤記録がすでに存在します。\n 勤務表スケジュールに移動します。");
            navigate("/workSchedule/list");
            return;
        }
        const storedFileStatus = localStorage.getItem("fileStatus");
        const storedSelectedFile = localStorage.getItem("selectedFile");
        if (storedFileStatus) {
            setFileStatus(JSON.parse(storedFileStatus));
        }
        if (storedSelectedFile) {
            setSelectedFile(storedSelectedFile);
        }
        setSavedData((prev) => ({
            ...prev,
            checkInTime: data.checkInTime || "",
            checkOutTime: data.checkOutTime || "",
            // breakTimeIn: data.breakTimeIn || "",
            // breakTimeOut: data.breakTimeOut || "",
            noBreakTime: data.breakTime <= 0 || false,
            workLocation: data.workLocation || "",
            workPosition: data.workPosition || "",
            basicWorkTime: data.basicWorkTime || "",
            flexTime: data.flexTime || false,
            memo: "",
        }));
    }, [workData, data, today]);

    const handleStart = async (e) => {
        e.preventDefault();
            if (!savedData.flexTime && savedData.checkInTime > data.checkInTime ||
                savedData.checkOutTime < data.checkOutTime) {
                if(savedData.memo.length === 0) {
                    window.alert("理由を入力してください。\n");
                    return;
                }
                if (savedData.memo.length > 0 && savedData.memo.length < 5) {
                    window.alert("理由が短すぎます。 5文字以上入力してください。");
                    return;
                }
            } else if (savedData.checkInTime === savedData.checkOutTime || data.checkInTime === data.checkOutTime) {
                window.alert("出勤時間と退勤時間が同じです。もう一度入力してください。");
                setSavedData((prev) => (
                    { ...prev, memo: ""}));
                return;
            }
            if(!savedData.flexTime && savedData.checkInTime > data.checkInTime && selectedFile === null && fileStatus === false) {
                const confirmDelete = window.confirm("遅延書ファイルをアップロードしていません。 \n 進めますか？");
                if (!confirmDelete) return;
            }

            try {
                const adjusted = adjustTime(savedData.checkOutTime);
                const toSave = {
                    ...savedData,
                    checkOutTime: adjusted.time,
                    breakTime: savedData.noBreakTime ? 0 : data.breakTime,
                };
                const axiosInstance = createAxiosInstance();
                await axiosInstance.post("/workSchedule/save", toSave);
                window.alert("通勤時間が記録されました。");
                localStorage.setItem("fileStatus", JSON.stringify(false));
                localStorage.removeItem("selectedFile");
                navigate("/workSchedule/list");
            } catch (error) {
                window.alert("エラーが発生しました。 もう一度お試しください。");
            }
    };



    const handleChange = (e) => {
        const { name, value } = e.target;
        setSavedData((prev) => ({ ...prev, [name]: value }));
    };

    //파일 변경 처리

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]); // 상태 업데이트
        }
    };

    const handleUpload = async () => {
        if(!selectedFile) {
            window.alert("ファイルを選択してください。");
            return;
        }
        if(localStorage.getItem("fileStatus")) {
            const confirmDelete = window.confirm("すでにファイルがアップロードされています。再アップロードしますか？");
            if (!confirmDelete) return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("date", today);
            formData.append("type", 0);
            const axiosInstance = createAxiosInstance();
            await axiosInstance.post("/workSchedule/file/upload",formData,{
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                },
            });
            window.alert("ファイルのアップロード完了");
            localStorage.setItem("fileStatus", JSON.stringify(true));
            localStorage.setItem("selectedFile", selectedFile.name);
            setProgress(100); // 완료 후 100% 유지
        } catch (error) {
            if (error.response && error.response.status === 400) {
                window.alert(error.response.data);
                localStorage.setItem("fileStatus", JSON.stringify(false));
            } else {
                window.alert("ファイルアップロード中にエラーが発生しました。");
                localStorage.setItem("fileStatus", JSON.stringify(false));
            }
        }finally {
            setUploading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center flex-column">
            <form onSubmit={handleStart}>
                <div className="card" style={{ minWidth: "359.2px"}}>
                    <div className="card-header">
                        <h2>勤務の出退勤記録</h2>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <div className="d-flex align-items-center justify-content-center gap-2 flex-nowrap">
                                <strong >出勤時間</strong>
                                <input
                                    name="checkInDate"
                                    type="date"
                                    className="form-control"
                                    style={{ maxWidth: "160px" }}
                                    value={savedData.checkInDate || ""}
                                    onChange={handleChange}
                                    hidden={true}
                                />
                                <input
                                    type="number"
                                    min="00"
                                    max="24"
                                    className="form-control"
                                    placeholder="時"
                                    style={{ width: "80px" }}
                                    value={savedData.checkInHour ?? (savedData.checkInTime?.split(":")[0] || "")}
                                    onChange={(e) => {
                                        const hour = e.target.value;
                                        const minute = savedData.checkInMinute ?? savedData.checkInTime?.split(":")[1] ?? "00";
                                        setSavedData((prev) => ({
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
                                    placeholder="分"
                                    style={{ width: "80px" }}
                                    value={savedData.checkInMinute ?? (savedData.checkInTime?.split(":")[1] || "")}
                                    onChange={(e) => {
                                        const minute = e.target.value;
                                        const hour = savedData.checkInHour ?? savedData.checkInTime?.split(":")[0] ?? "00";
                                        setSavedData((prev) => ({
                                            ...prev,
                                            checkInMinute: minute,
                                            checkInTime: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`,
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="d-flex align-items-center justify-content-center gap-2 flex-nowrap">
                                <strong >退勤時間</strong>
                                <input
                                    name="checkOutDate"
                                    type="date"
                                    className="form-control"
                                    style={{ maxWidth: "160px" }}
                                    value={savedData.checkOutDate || ""}
                                    onChange={handleChange}
                                    hidden={true}
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    className="form-control"
                                    placeholder="時"
                                    style={{ width: "80px" }}
                                    value={savedData.checkOutHour ?? (savedData.checkOutTime?.split(":")[0] || "")}
                                    onChange={(e) => {
                                        const hour = e.target.value;
                                        const minute = savedData.checkOutMinute ?? savedData.checkOutTime?.split(":")[1] ?? "00";
                                        const checkOutDate = parseInt(hour) >= 24
                                            ? new Date(new Date(savedData.checkInDate).getTime() + 86400000).toISOString().split("T")[0]
                                            : savedData.checkInDate;

                                        setSavedData((prev) => ({
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
                                    placeholder="分"
                                    style={{ width: "80px" }}
                                    value={savedData.checkOutMinute ?? (savedData.checkOutTime?.split(":")[1] || "")}
                                    onChange={(e) => {
                                        const minute = e.target.value;
                                        const hour = savedData.checkOutHour ?? savedData.checkOutTime?.split(":")[0] ?? "00";
                                        const checkOutDate = parseInt(hour) >= 24
                                            ? new Date(new Date(savedData.checkInDate).getTime() + 86400000).toISOString().split("T")[0]
                                            : savedData.checkInDate;
                                        setSavedData((prev) => ({
                                            ...prev,
                                            checkOutMinute: minute,
                                            checkOutDate: checkOutDate,
                                            checkOutTime: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`,
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                        <div className="form-group row">
                                <div className="d-flex align-items-center justify-content-center gap-2 flex-nowrap">
                                    <strong >フレックスタイム制</strong>
                                    <input
                                        type="checkbox"
                                        name="flexTime"
                                        style={{marginTop: "0px"}}
                                        className="form-check-input"
                                        checked={savedData?.flexTime}
                                        onChange={(e) => {
                                            setSavedData({
                                                ...savedData,
                                                flexTime: e.target.checked,
                                            });
                                        }
                                    }
                                    />
                                </div>
                        </div>
                        <div className="form-group row">
                            <div className="d-flex align-items-center justify-content-center gap-2 flex-nowrap">
                                <strong >休憩時間なし</strong>
                                <input
                                    type="checkbox"
                                    name="noBreakTime"
                                    style={{marginTop: "0px"}}
                                    className="form-check-input"
                                    checked={savedData?.noBreakTime}
                                    onChange={(e) => {
                                        setSavedData({
                                            ...savedData,
                                            noBreakTime: e.target.checked,
                                        });
                                    }
                                    }
                                />
                            </div>
                        </div>
                        {(!savedData.flexTime && savedData.checkInTime > data.checkInTime || savedData.checkOutTime < data.checkOutTime) && (
                            <>
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <strong className="col-3">理由 :</strong>
                                <textarea
                                    className="bi-textarea-resize input"
                                    name="memo"
                                    value={savedData.memo || ""}
                                    onChange={handleChange}
                                    placeholder="理由を入力してください。"
                                    maxLength={40}
                                    required = {!savedData.flexTime}
                                />
                                <small>{savedData.memo.length}/40</small>
                            </div>
                            </>
                        )}
                        {!savedData.flexTime &&savedData.checkInTime > data.checkInTime ? (
                            <div className="row-cols-1">
                                {uploading && (
                                    <div style={{ marginBottom: "10px" }}>
                                        <p>アップロード進行中: {progress}%</p>
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
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                                <div className="d-flex flex-column align-items-end gap-2 mb-3 my-2">
                                    <div>
                                        <strong>.jpg、.pngタイプのみアップロード可能</strong>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept=".jpg, .png" // 필요에 따라 확장자 제한
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <div>
                                        <button onClick={handleUpload}
                                                className="btn btn-info"
                                                type="button">
                                            アップロード
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                        <div className="card-footer bg-transparent">
                            <button type="submit" className="btn btn-primary w-100">
                                出退勤記録
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
export default WorkScheduleMain;
