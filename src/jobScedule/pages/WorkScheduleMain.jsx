import React, { useEffect, useState } from "react";
import createAxiosInstance from "../../config/api";
import useWorkDefaultData from "../utils/WorkDataDefault";
import useWorkData from "../utils/WorkData";
import { useNavigate } from "react-router-dom";
import "../../cssFiles/ScheduleMain.css";
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
        breakTimeIn: "",
        breakTimeOut: "",
        workType: "출근",
        workPosition: "",
        workLocation: "",
        basicWorkTime: "",
        memo: "",
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [progress, setProgress] = useState(0); // 업로드 진행 상태
    const [uploading, setUploading] = useState(false);
    const [fileStatus, setFileStatus ] = useState(false);


    // 기본 데이터 설정 (초기 실행)
    useEffect(() => {
        // console.log("1", workData)
        if (data.checkInTime === null) {
            window.alert("기본 근무시간을 설정해 주세요.");
            navigate("/workSchedule/dashBoard");
            return;
        }
        if (workData[today] !== undefined) {
            window.alert("이미 금일출근 기록이 있습니다. 출근리스트로 이동합니다.");
            navigate("/workSchedule/list");
            return;
        }
        const storedFileStatus = localStorage.getItem("fileStatus");
        const storedSelectedFile = localStorage.getItem("selectedFile");
        if (storedFileStatus) {
            setFileStatus(JSON.parse(storedFileStatus));
        }
        if (storedSelectedFile) {
            setSelectedFile(JSON.parse(storedSelectedFile));
        }
        setSavedData((prev) => ({
            ...prev,
            checkInTime: data.checkInTime,
            checkOutTime: data.checkOutTime,
            breakTimeIn: data.breakTimeIn,
            breakTimeOut: data.breakTimeOut,
            workLocation: data.workLocation,
            workPosition: data.workPosition,
            basicWorkTime: data.basicWorkTime,
            memo: "",
        }));
    }, [workData, data, today]);

    const handleStart = async (e) => {
        e.preventDefault();
            if (savedData.checkInTime !== data.checkInTime ||
                savedData.checkOutTime !== data.checkOutTime) {
                if(savedData.memo.length === 0) {
                    window.alert("사유를 입력해주세요.");
                    return;
                } if (savedData.memo.length < 5) {
                    window.alert("사유가 너무 짧습니다. 5자 이상 입력해주세요.");
                    return;
                }

            } else if (savedData.checkInTime === savedData.checkOutTime || data.checkInTime === data.checkOutTime) {
                window.alert("출근 시간과 퇴근 시간이 동일합니다. 다시 입력해주세요.");
                setSavedData((prev) => (
                    { ...prev, memo: ""}));
                return;
            }
            console.log("1", fileStatus);
            console.log("2", selectedFile);
            if(savedData.checkInTime !== data.checkInTime && selectedFile === null && fileStatus === false) {
                const confirmDelete = window.confirm("지연서 파일을 업로드 하지 않았습니다. \n 그래도 진행하시겠습니까?");
                if (!confirmDelete) return;
            }

            try {
                const axiosInstance = createAxiosInstance();
                await axiosInstance.post("/workSchedule/save", savedData);
                window.alert("출퇴근시간이 기록되었습니다.");

                navigate("/workSchedule/list");
            } catch (error) {
                window.alert("오류가 발생했습니다. 다시한번 시도해주세요.");
            } finally {
                setFileStatus(false);
            }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSavedData((prev) => ({ ...prev, [name]: value }));
    };

    //파일 변경 처리
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if(selectedFile === null) {
            window.alert("파일을 선택해주세요.");
            return;
        }
        if(fileStatus === true) {
            const confirmDelete = window.confirm("이미 업로드한 파일이 있습니다. 재업로드 하시겠습니까?");
            if (!confirmDelete) return;
        }
        setUploading(true);
        setProgress(0); // 초기화
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
                                const percentCompleted = Math.round(
                                    (progressEvent.loaded * 100) / progressEvent.total
                                );
                                setProgress(percentCompleted);
                            },
            });
            setFileStatus(true);
            window.alert("파일 업로드 성공!");
            localStorage.setItem("fileStatus", JSON.stringify(true));
            localStorage.setItem("selectedFile", JSON.stringify(selectedFile));
        } catch (error) {
            if (error.response && error.response.status === 400) {
                window.alert(error.response.data);
                setFileStatus(false);
            } else {
                window.alert("파일 업로드 중 오류가 발생했습니다.");
                setFileStatus(false);
            }
        }finally {
            setProgress(0);
            setUploading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center flex-column">
            <h2>근무 출퇴근 기록</h2>
            <form onSubmit={handleStart}>
                {/*encType="multipart/form-data"*/}
                <div>
                    <div className="d-flex align-items-center gap-2 mb-3 my-2">
                        <strong className="col-5">출근 시간 :</strong>
                        <input
                            type="time"
                            className="input"
                            name="checkInTime"
                            value={savedData.checkInTime || ""}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="d-flex align-items-center gap-2 mb-3">
                        <strong className="col-5">퇴근 시간 :</strong>
                        <input
                            type="time"
                            className="input"
                            name="checkOutTime"
                            value={savedData.checkOutTime || ""}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {(savedData.checkInTime !== data.checkInTime || savedData.checkOutTime !== data.checkOutTime) && (
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <strong className="col-3">사유 :</strong>
                            <textarea
                                className="bi-textarea-resize input"
                                name="memo"
                                value={savedData.memo || ""}
                                onChange={handleChange}
                                placeholder="출근, 퇴근시간이 기준과 다를 시 사유를 입력해 주세요."
                            />
                        </div>
                    )}
                    {savedData.checkInTime !== data.checkInTime ? (
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
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                            <div className="d-flex flex-column align-items-end gap-2 mb-3 my-2">
                                <div>
                                    <strong>지연표 업로드 .jpg, .png타입 업로드 가능</strong>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept=".jpg, .png" // 필요에 따라 확장자 제한
                                        onChange={handleFileChange}
                                        placeholder="지연표 업로드"
                                    />
                                </div>
                                <div>
                                    <button onClick={handleUpload}
                                            className="btn btn-info"
                                            type="button">
                                        업로드
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                    <button type="submit" className="btn btn-primary">
                        출퇴근 기록
                    </button>
                </div>
            </form>
        </div>

        // <div className="Container">
        //     <h2>근무 출퇴근 기록</h2>
        //     <form onSubmit={handleStart}>
        //         <div >
        //             <div className="Date">
        //                 <strong className="">출근 시간 :</strong>
        //                 <input
        //                     type="time"
        //                     className="Time"
        //                     name="checkInTime"
        //                     value={savedData.checkInTime || ""}
        //                     onChange={handleChange}
        //                     required
        //                 />
        //                 <strong className="">퇴근 시간 :</strong>
        //                 <input
        //                     type="time"
        //                     className="Time"
        //                     name="checkOutTime"
        //                     value={savedData.checkOutTime || ""}
        //                     onChange={handleChange}
        //                     required
        //                 />
        //             </div>
        //             {(savedData.checkInTime !== data.checkInTime || savedData.checkOutTime !== data.checkOutTime) && (
        //                 <div className="">
        //                     <strong className="">사유 :</strong>
        //                     <textarea
        //                         className=""
        //                         name="memo"
        //                         value={savedData.memo || ""}
        //                         onChange={handleChange}
        //                         placeholder="출근, 퇴근시간이 기준과 다를 시 사유를 입력해 주세요."
        //                     />
        //                 </div>
        //             )}
        //             {savedData.checkInTime !== data.checkInTime ? (
        //                 <div className="">
        //                     {uploading && (
        //                         <div style={{ marginBottom: "10px" }}>
        //                             <p>업로드 진행 중: {progress}%</p>
        //                             <div
        //                                 style={{
        //
        //                                 }}
        //                             >
        //                                 <div
        //                                     style={{
        //
        //                                     }}
        //                                 ></div>
        //                             </div>
        //                         </div>
        //                     )}
        //                     <div className="">
        //                         <div>
        //                             <strong>지연표 업로드 .jpg, .png타입 업로드 가능</strong>
        //                             <input
        //                                 type="file"
        //                                 className=""
        //                                 accept=".jpg, .png" // 필요에 따라 확장자 제한
        //                                 onChange={handleFileChange}
        //                                 placeholder="지연표 업로드"
        //                             />
        //                         </div>
        //                         <div>
        //                             <button onClick={handleUpload}
        //                                     className=""
        //                                     type="button">
        //                                 업로드
        //                             </button>
        //                         </div>
        //                     </div>
        //                 </div>
        //             ) : null}
        //             <button type="submit" className="">
        //                 출퇴근 기록
        //             </button>
        //         </div>
        //     </form>
        // </div>
    );
};


export default WorkScheduleMain;
