import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import useWorkDefaultData from "../utils/WorkDataDefault";
import {useAuth} from "../../config/AuthContext";
import createAxiosInstance from "../../config/api"; // 로그인 유저 정보를 가져오는 함수

function WorkScheduleDashboard (){
    const { username } = useAuth();
    const [item, setItem] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editedItem, setEditedItem] = useState({});
    const navigate = useNavigate();
    const location = useLocation();
    const workDefaultData = useWorkDefaultData();
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    useEffect(() => {
        const fetchWorkDefaultData = async () => {
            setLoading(true);
            setError("");
            if (!location.state !== null) {
            setIsEditing(location.state);
            }
            try {
                if(workDefaultData?.checkInTime === null) {
                    // ✅ employeeName이 없으면 기본 값 설정 (예외 처리)
                    const defaultData = {
                        employeeId: username, // 필요하면 수정
                        employeeName: workDefaultData?.employeeName || "", // 로그인한 사용자 이름 적용
                        workLocation: "",
                        workPosition: "",
                        checkInTime: "",
                        checkOutTime: "",
                        breakTimeIn: "",
                        breakTimeOut: "",
                        basicWorkTime: "",
                    };
                    setItem(defaultData);
                    setEditedItem(defaultData);
                }
                else if (isEditing) {
                    setItem(workDefaultData);
                    setEditedItem(workDefaultData);
                }else if (!isEditing && workDefaultData && Object.keys(workDefaultData).length > 0) {
                    navigate("/workSchedule/list");
                }
            } catch (error) {
                setError("근무표 기본 정보를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchWorkDefaultData();
    }, [workDefaultData, isEditing]);

    function handleClick() {
        navigate("/workSchedule/list");
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedItem((prevItem) => ({
            ...prevItem,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // 폼 제출 방지
        const confirmSave = window.confirm("기본 정보를 저장하시겠습니까?");
        if (!confirmSave) {
            return;
        } else {
            setLoading(true);
            setError("");
            try {
                const axiosInstance = createAxiosInstance(); // 인스턴스 생성
                await axiosInstance.put("/workSchedule/default/update", editedItem);
                // setItem(editedItem);
                window.alert("기본 정보를 저장하였습니다.");
                navigate("/workSchedule/list");
            } catch (error) {
                setError("기본설정 저장에 실패했습니다.");
            } finally {
                setLoading(false);
            }
        }
        };
    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container d-flex justify-content-center align-items-center flex-column">
                    <div className="card">
                        <form onSubmit={handleSubmit}>
                            <div className="card-header">
                                <h3>근무표 {editedItem.employeeName}의 마이페이지</h3>
                            </div>
                            <div className="card-body">
                                <div>
                                    <div className="form-group">
                                        <label className="label">ID</label>
                                        <div>
                                            <input
                                                className="input"
                                                type="text"
                                                name="employeeId"
                                                value={editedItem.employeeId? editedItem.employeeId : username}
                                                onChange={handleChange}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">이름</label>
                                        <div>
                                            <input
                                                className="input"
                                                type="text"
                                                name="employeeName"
                                                value={editedItem.employeeName}
                                                onChange={handleChange}
                                            disabled
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">근무지</label>
                                        <div>
                                            <input
                                                className="input"
                                                type="text"
                                                name="workLocation"
                                                value={editedItem.workLocation}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">기본 근무장소</label>
                                        <div>
                                            <select
                                                className="input"
                                                name="workPosition"
                                                value={editedItem.workPosition}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="" disabled>기본 근무장소 선택</option>
                                                <option value="현장">현장</option>
                                                <option value="본사">본사</option>
                                                <option value="재택근무">재택근무</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">기준 시간</label>
                                        <div>
                                            <input
                                                type="number"
                                                className="input"
                                                name="basicWorkTime"
                                                value={editedItem.basicWorkTime}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">기준 출근 시간</label>
                                        <div>
                                            <input
                                                type="time"
                                                className="input"
                                                name="checkInTime"
                                                value={editedItem.checkInTime}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">기준 퇴근 시간</label>
                                        <input
                                            type="time"
                                            className="input"
                                            name="checkOutTime"
                                            value={editedItem.checkOutTime}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">기준 휴게시간</label>
                                        <div className="d-flex">
                                            <input
                                                name="breakTimeIn"
                                                type="time"
                                                className="input me-2"
                                                value={editedItem.breakTimeIn}
                                                onChange={handleChange}
                                                required
                                            />
                                            <div className="text-gray-500 me-2 fs-5	">~</div>
                                            <input
                                                name="breakTimeOut"
                                                type="time"
                                                className="input"
                                                value={editedItem.breakTimeOut}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">

                                    {isEditing ?
                                        <button type="submit" className="btn btn-secondary" >수정하기</button>
                                        : <button type="submit" className="btn btn-secondary" >
                                            저장</button>
                                        }

                                {isEditing ? (
                                    <button type="button" className="btn btn-danger" onClick={handleClick}>
                                        취소
                                    </button>
                                ) : (
                                    <>
                                    </>
                                )
                                }
                            </div>
                        </form>
                    </div>
            </div>
    );
}
export default WorkScheduleDashboard;