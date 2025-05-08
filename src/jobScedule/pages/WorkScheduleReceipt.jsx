import React, {useEffect, useRef, useState, useCallback} from 'react';
import createAxiosInstance from "../../config/api";
import { useNavigate, useParams} from "react-router-dom";
import {useLoading} from "../../utils/LoadingContext";

const ReceiptList = () => {
    const { setIsProcessing } = useLoading();
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
    const fileInputRef = useRef(null);

    const [displayText, setDisplayText] = useState("");

    // 폼 초기화 함수 분리
    const resetForm = useCallback(() => {
        setNewReceipt({
            receiptDate: "",
            receiptType: "",
            receiptName: "",
            receiptItem: "",
            receiptContent: "",
            receiptAmount: "",
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    // 영수증 데이터 가져오기
    const fetchReceipts = useCallback(async () => {
        setIsProcessing(true);
        try {
            const axiosInstance = createAxiosInstance();
            const response = await axiosInstance.get(`/workSchedule/receipts/${month}`);
            setReceipts(response.data);
        } catch (error) {
            console.error('영수증 데이터 로드 실패:', error);
            alert("領収書データの読み込みに失敗しました。");
        } finally {
            setIsProcessing(false);
        }
    }, [month, setIsProcessing]);

    // 파일 업로드 프로그레스 관리 함수
    const handleFileUpload = async (formData) => {
        let lastUpdateTime = 0;
        const delay = 100;
        const axiosInstance = createAxiosInstance();

        return await axiosInstance.post("/workSchedule/receipts", formData, {
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
    };

    // displayText 로컬스토리지에서 가져오기
    useEffect(() => {
        const storedDisplayText = localStorage.getItem("displayText");
        if (storedDisplayText) {
            setDisplayText(storedDisplayText);
        }
    }, []);

    // 영수증 목록 가져오기
    useEffect(() => {
        fetchReceipts();
    }, [fetchReceipts]);

    // 입력값 처리
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

    // 새 영수증 추가
    const handleAddReceipt = async (e) => {
        e.preventDefault();

        // 필수 입력값 검증
        if(!newReceipt.receiptType) {
            window.alert("タイプを選択してください。");
            return;
        }

        if(newReceipt.receiptType !== "既存" && selectedFile === null) {
            window.alert("ファイルを選択してください。");
            return;
        }

        setUploading(true);
        setProgress(0);
        setIsProcessing(true);

        try {
            const formData = new FormData();

            // 타입에 따라 파일 추가
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

            // 업로드 처리
            await handleFileUpload(formData);

            window.alert("領収書情報が保存されました。");

            // 프로그레스 업데이트 (완료 처리)
            setTimeout(() => {
                setProgress(100);
                setTimeout(() => {
                    setProgress(0);
                }, 800);
            }, 200);

            // 입력 폼 초기화
            resetForm();

            // 목록 새로고침
            fetchReceipts();

        } catch (error) {
            console.error('영수증 저장 실패:', error);
            window.alert('領収書情報の保存に失敗しました。');
        } finally {
            setUploading(false);
            setIsProcessing(false);
        }
    };

    // 목록 화면으로 이동
    const handleClickList = () => {
        navigate("/workSchedule/list");
    };

    // 영수증 삭제
    const handleDeleteReceipt = async (id, name) => {
        const confirmDelete = window.confirm(`${name}の領収書を削除しますか？`);

        if (!confirmDelete) {
            return;
        }

        setIsProcessing(true);

        try {
            const axiosInstance = createAxiosInstance();
            await axiosInstance.delete(`/workSchedule/receipts/${id}`);
            window.alert('領収書が削除されました。');
            fetchReceipts();
        } catch (error) {
            console.error('영수증 삭제 실패:', error);
            window.alert("領収書削除に失敗しました。");
        } finally {
            setIsProcessing(false);
        }
    };

    // 파일 선택 처리
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png'];

            if (!allowedTypes.includes(file.type)) {
                alert("JPGまたはPNG形式のみアップロードできます。");
                e.target.value = null;
                setSelectedFile(null);
                return;
            }

            setSelectedFile(file);
        }
    };

    // 날짜 기준으로 정렬된 영수증 목록
    const sortedReceipts = React.useMemo(() => {
        return [...receipts].sort((a, b) => new Date(a.receiptDate) - new Date(b.receiptDate));
    }, [receipts]);

    // 편집 모드 표시 여부 확인
    const isEditMode = ![
        "sending", "reSending", "confirm", "finalConfirm"
    ].includes(displayText);

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
                                {sortedReceipts.map((receipt, index) => (
                                    <tr key={index}>
                                        <td>
                                            {isEditMode && (
                                                <a onClick={() => handleDeleteReceipt(receipt.id, receipt.receiptName)}
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

                {isEditMode && (
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
                                                    disabled={newReceipt.receiptType === "既存"}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary me-4" type="submit">保存</button>
                                    <button className="btn btn-info" type="button"
                                            onClick={() => {
                                                setIsAdding(false);
                                                resetForm();
                                            }}
                                    >キャンセル</button>
                                </div>
                            </ul>
                        )}
                    </>
                )}
            </form>
        </div>
    );
};

export default ReceiptList;