import React, {useEffect, useState} from 'react';
import createAxiosInstance from "../../config/api";
import {useNavigate, useParams} from "react-router-dom";

const ReceiptList = () => {
    const { date } = useParams();
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);  // 영수증 리스트
    // console.log("1",newReceipt)

    useEffect(() => {
        fetchReceipts();
    }, [date]);

    const fetchReceipts = async () => {
        try {
            const axiosInstance = createAxiosInstance();
            const response = await axiosInstance.get(`/workSchedule/receipts/${date}`, {
                    params: {manager: true}
                });
            setReceipts(response.data);
            console.log('영수증 전체 데이터', response.data);
        } catch (error) {
            console.error('영수증 데이터를 불러오는 데 실패했습니다:', error);
        }
    };

    function handleClickList() {
        // navigate("/workSchedule/list");
    }


    return (
        <div className="container">
                <h2 className="text-dark">{date} 영수증 목록</h2>
                <button className="btn btn-primary " type="button" onClick={handleClickList}>
                    목록으로
                </button>
                {receipts.length === 0 ? (
                    <>
                        <p>영수증정보가 없습니다.</p>
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
                                {receipts
                                    .sort((a, b) => new Date(a.receiptDate) - new Date(b.receiptDate))  // 날짜 오름차순 정렬
                                    .map((receipt, index) => (
                                    <tr key={index}>
                                        <td>
                                            {receipt.receiptDate}
                                        </td>
                                        <td className="table-data">{receipt.receiptType}</td>
                                        <td className="table-data">{receipt.receiptName}</td>
                                        <td className="table-data">{receipt.receiptItem}</td>
                                        <td className="table-data">{receipt.receiptContent}</td>
                                        <td className="table-data">¥{receipt.receiptAmount.toLocaleString("en-US")}</td>
                                        <td className="table-data">{receipt.receiptStatus === 0 ? "미처리":"처리완료"}</td>
                                        <td className="table-data">
                                            {receipt.fileId != null ? (
                                                <>
                                                    <a href={`https://drive.google.com/file/d/${receipt.fileId}/view?usp=drive_link`}
                                                       target="_blank"
                                                       rel="noopener noreferrer">
                                                        <i className="bi bi-file-earmark-check-fill"></i>
                                                    </a>
                                                </>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </ul>
                )}
        </div>
    );
};

export default ReceiptList;
