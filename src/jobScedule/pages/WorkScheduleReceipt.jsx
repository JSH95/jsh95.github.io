import React, {useEffect, useState} from 'react';
import createAxiosInstance from "../../config/api";
import {data, useNavigate, useParams} from "react-router-dom";

const ReceiptList = () => {
    const { month } = useParams();
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);  // 영수증 리스트
    const [newReceipt, setNewReceipt] = useState([]);  // 새 영수증 내용
    const [isAdding, setIsAdding] = useState(false);  // 새로운 영수증 입력 창의 표시 여부
    const [progress, setProgress] = useState(0); // 업로드 진행 상태
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    // console.log("1",newReceipt)

    useEffect(() => {
        fetchReceipts();
    }, [month]);

    const fetchReceipts = async () => {
        try {
            const axiosInstance = createAxiosInstance();
            const response = await axiosInstance.get(`/workSchedule/receipts/${month}`);  // API 엔드포인트 호출
            setReceipts(response.data);  // 서버로부터 받은 데이터를 상태에 저장
            // console.log('데이터', response.data);
        } catch (error) {
            console.error('영수증 데이터를 불러오는 데 실패했습니다:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewReceipt((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    const handleAddReceipt = async (e) => {
        e.preventDefault();
        if(selectedFile === null) {
            window.alert("파일을 선택해주세요.");
            return;
        }
        setUploading(true);
        setProgress(0); // 초기화
            try {
                const formData = new FormData();
                formData.append("file", selectedFile);
                formData.append("date", newReceipt.receiptDate);
                formData.append("type", 1);
                formData.append(
                    "employeeReceiptData",
                    new Blob([JSON.stringify(newReceipt)], { type: "application/json" })
                );
                const axiosInstance = createAxiosInstance();
                await axiosInstance.post("/workSchedule/receipts", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setProgress(percentCompleted);
                    },
                });  // API 엔드포인트 호출
                window.alert('영수증이 정보가 저장되었습니다.');
                setNewReceipt([]);
                setIsAdding(false);  // 저장 후 입력 창 숨기기
                fetchReceipts();  // 저장 후 데이터 다시 불러오기
            }catch (e) {
                window.alert('영수증 정보를 저장하는 데 실패했습니다:', e);
            }finally {
                setProgress(0);
                setUploading(false);
            }
    };

    function handleClickList() {
        navigate("/workSchedule/list");
    }

    const handleClickEdit = async (id, name) => {
        const confirmSave = window.confirm(`${name}` + "의 해당 영수증을 삭제 하시겠습니까?");
        if (!confirmSave) {
            return;
        } else {
            try{
                const axiosInstance = createAxiosInstance();
                const response = await axiosInstance.delete(`/workSchedule/receipts/${id}`);
                window.alert('영수증이 삭제되었습니다.');
                fetchReceipts();
                // console.log("레스",response);
            }catch (e){
                console.error('영수증 삭제 실패:', e);
            }
        }
    }

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    return (
        <div className="container">
            <form onSubmit={handleAddReceipt}>
                <h2 className="text-dark">{month}월 영수증 목록</h2>
                <button className="btn btn-primary " type="button" onClick={handleClickList}>
                    목록으로
                </button>
                {receipts.length === 0 ? (
                    <>
                        <p>영수증을 추가해 주세요</p>
                    </>
                ) : (
                    <ul>
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                <tr>
                                    <th className="text-center">날짜</th>
                                    <th className="text-center">타입</th>
                                    <th className="text-center">지불처</th>
                                    <th className="text-center">지급항목</th>
                                    <th className="text-center">지불내용</th>
                                    <th className="text-center">지급금액</th>
                                    <th className="text-center">상태</th>
                                    <th className="text-center">영수증</th>
                                </tr>
                                </thead>
                                <tbody>
                                {receipts.map((receipt, index) => (
                                    <tr key={index}>
                                        <td>
                                            <i class="bi bi-trash-fill"
                                               onClick={() => handleClickEdit(
                                                   receipt.id, receipt.receiptName
                                               )}
                                            >
                                            </i> &nbsp;
                                            {receipt.receiptDate}
                                        </td>
                                        <td>{receipt.receiptType}</td>
                                        <td>{receipt.receiptName}</td>
                                        <td>{receipt.receiptItem}</td>
                                        <td>{receipt.receiptContent}</td>
                                        <td>{receipt.receiptAmount}</td>
                                        <td>{receipt.receiptStatus == 0 ? "미처리":"처리완료"}</td>
                                        <td>
                                            {receipt.fileId != null ? (
                                                <>
                                                {/*https://drive.google.com/file/d/1XGohMxZcXQaIcQxiDIivDTT-_q7HiPCH/view?usp=drive_link*/}
                                                    <a href={`https://drive.google.com/file/d/${receipt.fileId}/view?usp=drive_link`}
                                                       target="_blank"
                                                       rel="noopener noreferrer">
                                                        <i className="bi bi-file-earmark-check-fill"></i>
                                                    </a>
                                                </>
                                            ) : (null)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                    </ul>
                )}
                <h2>
                    <i className="bi bi-plus-square-dotted" onClick={() => setIsAdding(true)}></i>
                </h2>
                {isAdding && (
                    <ul>
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                            <tr>
                                <th className="text-center">날짜</th>
                                <th className="text-center">타입</th>
                                <th className="text-center">지불처</th>
                                <th className="text-center">지급항목</th>
                                <th className="text-center">지불내용</th>
                                <th className="text-center">지급금액</th>
                                <th className="text-center">상태</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td><input
                                    type="date"
                                    value={newReceipt?.receiptDate  || ""}
                                    className="input"
                                    name="receiptDate"
                                    onChange={handleChange}
                                    required
                                /></td>
                                <td><select
                                    value={newReceipt?.receiptType || ""}
                                    className="input w-100"
                                    name="receiptType"
                                    onChange={handleChange}
                                    style={{
                                        whiteSpace: "nowrap", // 텍스트가 줄바꿈 없이 한 줄로 표시되도록
                                        display: "block"
                                    }}
                                    required
                                >
                                    <option value="" disabled>신규, 갱신</option>
                                    <option value="기존">기존</option>
                                    <option value="신규">신규</option>
                                    
                                </select></td>
                                <td><input
                                    type="text"
                                    className="input"
                                    value={newReceipt?.receiptName  || ""}
                                    name="receiptName"
                                    onChange={handleChange}
                                    placeholder="지불처"
                                    required
                                /></td>
                                <td><select
                                    value={newReceipt?.receiptItem || ""}
                                    className="input me-5"
                                    name="receiptItem"
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled>지급 항목</option>
                                    <option value="통근비">통근비</option>
                                    <option value="연수비">연수비</option>
                                    <option value="대납경비">대납경비</option>
                                </select></td>
                                <td><textarea
                                    value={newReceipt?.receiptContent || ""}
                                    className="input"
                                    name="receiptContent"
                                    onChange={handleChange}
                                    placeholder="지불 내용"
                                    required
                                    style={{
                                        width: "200px", // 넓이를 100%로 설정하여 td에 맞게 확장
                                        // padding: "0.375rem 0.75rem", // 텍스트와 경계 사이에 여유 공간
                                        // fontSize: "1rem", // 폰트 크기 조정
                                        // boxSizing: "border-box", // padding이 요소 크기를 초과하지 않게 설정
                                    }}
                                /></td>
                                <td><input
                                    type="text"
                                    value={newReceipt?.receiptAmount || ""}
                                    className="input"
                                    name="receiptAmount"
                                    onChange={handleChange}
                                    placeholder="지급 금액"
                                    required
                                /></td>
                                <td><input
                                    type="text"
                                    value={newReceipt?.receiptStatus || ""}
                                    className="input"
                                    name="receiptStatus"
                                    onChange={handleChange}
                                    placeholder="미처리"
                                    disabled
                                /></td>
                            </tr>
                            </tbody>
                        </table>
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
                            <div className="d-flex align-items-center gap-2 mb-2 my-2 justify-content-start">
                                <strong>영수증 업로드 .jpg, .png타입 업로드 가능</strong>
                            </div>
                            <div className="d-flex gap-2 mb-3" style={{ width: '100%' }}>
                                <div className="input-group">
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept=".jpg, .png"
                                        onChange={handleFileChange}
                                        placeholder="지연표 업로드"
                                    />
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-primary me-4" type="submit">저장</button>
                        <button className="btn btn-info" type="button" onClick={() => setIsAdding(false)}>취소</button>
                    </div>
                    </ul>
                )}
            </form>
        </div>
    );
};

export default ReceiptList;
