import React, {useEffect, useRef, useState} from 'react';
import createAxiosInstance from "../../config/api";
import { useNavigate, useParams} from "react-router-dom";
import {useLoading} from "../../utils/LoadingContext";


const ReceiptList = () => {
    const { setIsProcessing } = useLoading();
    // const location = useLocation();
    // const { state } = location;
    // const displayText = state?.displayText;
    const { month } = useParams();
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);  // 영수증 리스트
    const [newReceipt, setNewReceipt] = useState({
        receiptDate: "",  // 날짜
        receiptType: "",  // 타입
        receiptName: "",  // 지불처
        receiptItem: "",  // 지급항목
        receiptContent: "",  // 지불내용
        receiptAmount: "",  // 지급금액
    });  // 새 영수증 내용
    
    const [isAdding, setIsAdding] = useState(false);  // 새로운 영수증 입력 창의 표시 여부
    const [progress, setProgress] = useState(0); // 업로드 진행 상태
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null)

    const [displayText, setDisplayText] = useState("");

    useEffect(() => {
        const storedDisplayText = localStorage.getItem("displayText");
        if (storedDisplayText) {
            setDisplayText(storedDisplayText);
        }
    }, []);

    useEffect(() => {
        fetchReceipts();
    }, [month]);

    const fetchReceipts = async () => {
        setIsProcessing(true); // 로딩 상태 설정
        try {
            const axiosInstance = createAxiosInstance();
            const response = await axiosInstance.get(`/workSchedule/receipts/${month}`);  // API 엔드포인트 호출
            setReceipts(response.data);  // 서버로부터 받은 데이터를 상태에 저장
        } catch (error) {
            // console.error('영수증 데이터를 불러오는 데 실패했습니다:', error);
            alert("領収書データの読み込みに失敗しました。")
        } finally {
            setIsProcessing(false); // 로딩 상태 해제
        }
    };



    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "receiptAmount") {
            const numeric = value.replace(/[^\d]/g, ""); // 숫자만 추출
            const number = numeric ? parseInt(numeric, 10) : "";

            setNewReceipt((prev) => ({
                ...prev,
                [name]: number,
            }));
        } else {
            setNewReceipt((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleAddReceipt = async (e) => {
        e.preventDefault();

        if(selectedFile === null && newReceipt.receiptType !== "既存") {
            window.alert("ファイルを選択してください。");
            return;
        }
        setUploading(true);
        setProgress(0); // 초기화
        setIsProcessing(true); // 로딩 상태 설정
        try {
                let lastUpdateTime = 0;
                const delay = 100; // 업데이트 간격 (ms)
                const formData = new FormData();
                if(newReceipt.receiptType !== "既存"){
                    formData.append("file", selectedFile);
                } else {
                    // 더미 빈 파일 생성
                    const dummyFile = new Blob([], { type: 'application/octet-stream' });
                    formData.append("file", dummyFile, "empty.txt");
                }
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
                        const now = Date.now();
                        if (now - lastUpdateTime > delay) {
                            setProgress(percentCompleted > 95 ? 95 : percentCompleted);
                            lastUpdateTime = now;
                        }
                    },
                });  // API 엔드포인트 호출
                window.alert("領収書情報が保存されました。");
                setTimeout(() => {
                    setProgress(100); // 약간의 텀을 두고 100% 표시
                    setTimeout(() => {
                        setProgress(0); // 필요시 리셋
                    }, 800);
                }, 200); // 0.2초 정도 후에 100%로 업데이트

                setNewReceipt({
                    receiptDate: "",
                    receiptType: "",
                    receiptName: "",
                    receiptItem: "",
                    receiptContent: "",
                    receiptAmount: "",
                });
                setSelectedFile(null); // 선택된 파일 초기화
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // 파일 선택 초기화
                }
                fetchReceipts();  // 저장 후 데이터 다시 불러오기
            }catch (e) {
                window.alert('領収書情報の保存に失敗しました。');
            }finally {
                setUploading(false);
            setIsProcessing(false); // 로딩 상태 해제
        }
    };

    function handleClickList() {
        navigate("/workSchedule/list");
    }

    const handleClickEdit = async (id, name) => {
        const confirmSave = window.confirm(`${name}の領収書を削除しますか？`);
        if (!confirmSave) {
            return;
        } else {
            setIsProcessing(true);
            try{
                const axiosInstance = createAxiosInstance();
                await axiosInstance.delete(`/workSchedule/receipts/${id}`);
                window.alert('領収書が削除されました。');
                fetchReceipts();
            }catch (e){
                // console.error('영수증 삭제 실패:', e);
                window.alert("領収書削除に失敗しました。");
            } finally {
                setIsProcessing(false); // 로딩 상태 해제
            }
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                alert("JPGまたはPNG形式のみアップロードできます。");
                e.target.value = null; // input 초기화
                setSelectedFile(null); // 선택된 파일 초기화
                return;
            }
            setSelectedFile(file); // 파일 선택 처리
        }
    };

    return (
        <div className="container">
            <form onSubmit={handleAddReceipt}>
                <h2 className="text-dark">{month}月の領収書</h2>
                <button className="btn btn-primary " type="button" onClick={handleClickList}>
                    戻る
                </button>
                {receipts.length === 0 ? (
                    <>
                        <p>領収書を追加してください</p>
                    </>
                ) : (
                    <ul>
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                <tr>
                                    <th className="text-center">日付</th>
                                    <th className="text-center">タイプ</th>
                                    <th className="text-center">支払先</th>
                                    <th className="text-center">支給項目</th>
                                    <th className="text-center">支払内容</th>
                                    <th className="text-center">支給金額</th>
                                    <th className="text-center">ステータス</th>
                                    <th className="text-center">ファイル</th>
                                </tr>
                                </thead>
                                <tbody>
                                {receipts
                                    .sort((a, b) => new Date(a.receiptDate) - new Date(b.receiptDate))  // 날짜 오름차순 정렬
                                    .map((receipt, index) => (
                                    <tr key={index}>
                                        <td>
                                            {displayText === "sending" || displayText === "reSending" || displayText === "confirm" || displayText === "finalConfirm" ? null :(
                                                <a onClick={() => handleClickEdit(receipt.id, receipt.receiptName)}
                                                   style={{ cursor: "pointer", transition: "color 0.2s ease-in-out" }}
                                                   className="me-2"
                                                >
                                                    <i className="bi bi-trash-fill"></i>
                                                </a>
                                            )}
                                            {receipt.receiptDate}
                                        </td>
                                        <td className="table-data">{receipt.receiptType}</td>
                                        <td className="table-data">{receipt.receiptName}</td>
                                        <td className="table-data">{receipt.receiptItem}</td>
                                        <td className="table-data">{receipt.receiptContent}</td>
                                        <td className="table-data">¥{receipt.receiptAmount.toLocaleString()}</td>
                                        <td className="table-data">{receipt.receiptStatus === 0 ? "未処理":"処理完了"}</td>
                                        <td className="table-data">
                                            {receipt.fileId != null ? (
                                                <>
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

                {displayText === "sending" || displayText === "reSending" || displayText === "confirm" || displayText === "finalConfirm" ? null :
                    <>
                        <h2>
                            <i className="bi bi-plus-square-dotted" onClick={() => setIsAdding(true)}></i>
                        </h2>
                        {isAdding && (
                            <ul>
                                <div className="table-responsive">
                                    <table className="table table-striped" style={{ tableLayout: "auto" }}>
                                        <thead>
                                        <tr>
                                            <th className="text-center">日付</th>
                                            <th className="text-center">タイプ</th>
                                            <th className="text-center">支払先</th>
                                            <th className="text-center">支給項目</th>
                                            <th className="text-center">支払内容</th>
                                            <th className="text-center">支給金額</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td className="table-data">
                                                <input
                                                    type="date"
                                                    value={newReceipt?.receiptDate  || ""}
                                                    className="input"
                                                    name="receiptDate"
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </td>
                                            <td className="table-data"><select
                                                value={newReceipt?.receiptType || ""}
                                                className="input"
                                                name="receiptType"
                                                onChange={handleChange}
                                                required
                                                style={{
                                                    minWidth: "150px", // 최소 너비 설정
                                                    width: "100%", // 유동적인 너비
                                                    boxSizing: "border-box", // 패딩과 보더를 포함한 너비 설정
                                                }}
                                            >
                                                <option value="" disabled>新規, 既存</option>
                                                <option value="既存">既存</option>
                                                <option value="新規">新規</option>
                                            </select></td>
                                            <td className="table-data"><input
                                                type="text"
                                                className="input"
                                                value={newReceipt?.receiptName  || ""}
                                                name="receiptName"
                                                onChange={handleChange}
                                                placeholder="支払い先"
                                                required
                                                style={{
                                                    minWidth: "150px", // 최소 너비 설정
                                                    width: "100%", // 유동적인 너비
                                                    boxSizing: "border-box", // 패딩과 보더를 포함한 너비 설정
                                                }}
                                            /></td>
                                            <td className="table-data"><select
                                                value={newReceipt?.receiptItem || ""}
                                                className="input"
                                                name="receiptItem"
                                                onChange={handleChange}
                                                required
                                                style={{
                                                    minWidth: "150px", // 최소 너비 설정
                                                    width: "100%", // 유동적인 너비
                                                    boxSizing: "border-box", // 패딩과 보더를 포함한 너비 설정
                                                }}
                                            >
                                                <option value="" disabled>支給項目</option>
                                                <option value="通勤費">通勤費</option>
                                                <option value="代納経費">代納経費</option>
                                                <option value="研修費">研修費</option>
                                            </select></td>
                                            <td className="table-data">
                                        <textarea
                                            value={newReceipt?.receiptContent || ""}
                                            className="input"
                                            name="receiptContent"
                                            onChange={handleChange}
                                            placeholder="支払い内容"
                                            required
                                            style={{
                                                minWidth: "160px", // 최소 너비 설정
                                                width: "100%", // 유동적인 너비
                                                boxSizing: "border-box", // 패딩과 보더를 포함한 너비 설정
                                            }}
                                        /></td>
                                            <td className="table-data">
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <input
                                                        inputMode="numeric"
                                                        type="text"
                                                        value={newReceipt?.receiptAmount
                                                            ? "¥" + newReceipt.receiptAmount.toLocaleString()
                                                            : ""}
                                                        className="input"
                                                        name="receiptAmount"
                                                        onChange={handleChange}
                                                        onKeyPress={(e) => {
                                                            const code = e.charCode || e.keyCode;

                                                            // 허용하는 키: 반각 숫자만
                                                            if (code < 48 || code > 57) {
                                                                e.preventDefault(); // 입력 차단
                                                            }
                                                        }}
                                                        placeholder="支払金額"
                                                        required
                                                        style={{
                                                            minWidth: "150px",
                                                            width: "100%",
                                                            boxSizing: "border-box",
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <div className="row-cols-1"
                                         style={{
                                             minWidth: "350px", // 최소 너비 설정
                                             width: "50%", // 유동적인 너비
                                             boxSizing: "border-box", // 패딩과 보더를 포함한 너비 설정
                                         }}
                                    >
                                        {uploading && (
                                            <div style={{ marginBottom: "10px" }}>
                                                <p>アップロード進行中: {progress}%</p>
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
                                                            transition: "width 0.5s ease-in-out", // 진행률 변경 시 부드럽게 애니메이션 효과
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="d-flex align-items-center gap-2 mb-2 my-2 justify-content-start">
                                            <strong>
                                                .jpg、.pngタイプのみアップロード可能 <br/>
                                                新規タイプのみファイルアップロード可能
                                            </strong>
                                        </div>
                                        <div className="d-flex gap-2 mb-3">
                                            <div className="input-group">
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    accept=".jpg, .png"
                                                    onChange={handleFileChange}
                                                    ref={fileInputRef} // ref 연결
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary me-4" type="submit">保存</button>
                                    <button className="btn btn-info" type="button"
                                            onClick={() => setIsAdding(false)}
                                    >キャンセル</button>
                                </div>
                            </ul>
                        )}
                    </>
                }
            </form>
        </div>
    );
};

export default ReceiptList;
