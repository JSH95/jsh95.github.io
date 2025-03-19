import React, {useEffect, useState} from "react";
import { useNavigate, useParams} from "react-router-dom";
import useWorkData from "../../jobScedule/utils/WorkData";

function AdminWorkScheduleDashboard (){
    const { date } = useParams();
    const { id } = useParams();
    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth()+ 1;
    const navigate = useNavigate();
    const [item, setItem] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const workData = useWorkData(year, month, id); // ✅ 최상위에서 호출

    useEffect(() => {
        setLoading(true);
        try{
            if (workData.workData[date]) {
                setItem(workData.workData[date]);
                // console.log ("item 가공데이터 : " ,item)
            } else {
                setItem(null);
            }
        }catch (error){
            setItem(null);
            setError("데이터를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }


    }, [workData?.workData[date]]);

    function handleClickBack() {
        const year = new Date(date).getFullYear();
        const month = new Date(date).getMonth() + 1;
        navigate(`/workSchedule/adminList/${id}`, { state: { year, month }} );
    }

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;
    return (
        <div className="container d-flex justify-content-center align-items-center flex-column">
            <div className="card">
                <div className="card-header">
                    <h3>근무표 상세 페이지</h3>
                </div>
                <div className="card-body">
                                <div className="form-group">
                                    <label className="label">출퇴근 시간</label>
                                    <div className="d-flex">
                                        <input
                                            type="time"
                                            className="input"
                                            value={item?.checkInTime || ""}
                                            readOnly
                                        />
                                        <span> ~ </span>
                                        <input
                                            type="time"
                                            className="input"
                                            value={item?.checkOutTime || ""}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="label">휴게시간</label>
                                    <div className="d-flex">
                                        <input
                                            type="time"
                                            className="input"
                                            value={item?.breakTimeIn || ""}
                                            readOnly
                                        />
                                        <span className="text-gray-500 me-2 fs-5"> ~ </span>
                                        <input
                                            type="time"
                                            className="input"
                                            value={item?.breakTimeOut|| ""}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="label">근무 유형</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={item?.workType|| ""}
                                        readOnly
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">근태 유형</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={item?.workPosition|| ""}
                                        readOnly
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">근무지</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={item?.workLocation|| ""}
                                        readOnly
                                    />
                                </div>
                                {item?.memo ? (<div className="form-group">
                                    <label>사유</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={item?.memo|| ""}
                                        readOnly
                                    />
                                </div>
                                ) : (null)}
                                {item?.fileId ? (
                                    <div className="form-group">
                                        <label>지연표 업로드 내역</label>
                                        <span>
                                            <a href={item.fileUrl} target="_blank" rel="noreferrer">
                                                {item.fileName.split("_").pop()}
                                            </a>
                                        </span>
                                    </div>
                                    ) :
                                     null
                                }
                </div>
                <div className="card-footer">
                    <div className="d-flex">
                            <button
                                type="button"
                                className="btn btn-secondary w-100"
                                onClick={handleClickBack}
                            >
                                돌아가기
                            </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default AdminWorkScheduleDashboard;