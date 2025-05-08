import React, {useEffect, useState} from "react";
import { useNavigate} from "react-router-dom";
import useWorkDefaultData from "../utils/WorkDataDefault";
import {useAuth} from "../../config/AuthContext";
import createAxiosInstance from "../../config/api";

function WorkScheduleDashboard (){
    const { username } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editedItem, setEditedItem] = useState({});
    const navigate = useNavigate();
    const workDefaultData = useWorkDefaultData();

    useEffect(() => {
        const fetchWorkDefaultData = async () => {
            setLoading(true);
            setError("");
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
                        // breakTimeIn: "",
                        // breakTimeOut: "",
                        breakTime : "",
                        flexTime: false,
                    };
                    setEditedItem(defaultData);
                    setIsEditing(false);
                }
                else{
                    setEditedItem(workDefaultData);
                    setIsEditing(true);
                }
            } catch (error) {
                setError("勤務表の基本情報を読み込めませんでした。\n リロードまたは管理者にお問い合わせください");
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
        const confirmSave = window.confirm("基本情報を保存しますか？");
        if (!confirmSave) {
            return;
        } else {
            setLoading(true);
            setError("");
            try {
                const axiosInstance = createAxiosInstance(); // 인스턴스 생성
                await axiosInstance.put("/workSchedule/default/update", editedItem);
                // setItem(editedItem);
                window.alert("基本情報を保存しました。");
                navigate("/workSchedule/list");
            } catch (error) {
                setError("基本情報の保存に失敗しました。");
            } finally {
                setLoading(false);
            }
        }
        };

    // const handleTimeChange = (name, value) => {
    //     setEditedItem((prevItem) => ({
    //         ...prevItem,
    //         checkInTime: value,
    //     }));
    // };
    //
    // if (loading) return <div>로딩 중...</div>;
    // if (error) return <div>{error}</div>;

    return (
        <div className="container d-flex justify-content-center align-items-center flex-column">
            <div className="card" style={{ width: '100%', maxWidth: '300px', minHeight: '500px' }}>
                        <form onSubmit={handleSubmit}>
                            <div className="card-header">
                                <h3 className="title mb-0" style={{ color: "white"}}>勤務表の基本情報</h3>
                            </div>
                            <div className="card-body">
                                <div>
                                    <div className="form-group">
                                        <div>
                                            <input
                                                className="input"
                                                type="text"
                                                name="employeeId"
                                                value={editedItem.employeeId? editedItem.employeeId : username || ""}
                                                onChange={handleChange}
                                                disabled
                                                hidden
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <div>
                                            <input
                                                className="input"
                                                type="text"
                                                name="employeeName"
                                                value={editedItem.employeeName || ""}
                                                onChange={handleChange}
                                            disabled
                                                hidden
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">勤務地</label>
                                        <div>
                                            <input
                                                className="input"
                                                type="text"
                                                name="workLocation"
                                                value={editedItem.workLocation || ""}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">基本勤務場所</label>
                                        <div>
                                            <select
                                                className="input"
                                                name="workPosition"
                                                value={editedItem.workPosition || ""}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="" disabled>基本勤務場所を選択</option>
                                                <option value="現場">現場</option>
                                                <option value="本社">本社</option>
                                                <option value="在宅勤務">在宅勤務</option>
                                            </select>
                                        </div>
                                    </div>
                                        <div className="row">
                                            <div className="col">
                                                <label className="label">フレックス勤務制</label>
                                            </div>
                                            <div className="col">
                                                <input
                                                    type="checkbox"
                                                    name="flexTime"
                                                    className="form-check-input"
                                                    style={{marginBottom: "5px" , marginTop: "0px"}}
                                                    checked={editedItem.flexTime || false}
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
                                    <div className="form-group">
                                        <label className="label">基準出勤時間</label>
                                        <div className="d-flex align-items-center justify-content-start gap-2 flex-nowrap">
                                            <input
                                                type="number"
                                                min="00"
                                                max="23"
                                                className="form-control"
                                                placeholder="時"
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
                                                placeholder="分"
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
                                    <div className="form-group">
                                        <label className="label">基準退勤時間</label>
                                        <div className="d-flex align-items-center justify-content-start gap-2 flex-nowrap">
                                            <input
                                                type="number"
                                                min="0"
                                                max="99"
                                                className="form-control"
                                                placeholder="時"
                                                style={{ width: "80px" }}
                                                value={editedItem.checkOutHour ?? (editedItem.checkOutTime?.split(":")[0] || "")}
                                                onChange={(e) => {
                                                    const hour = e.target.value;
                                                    const minute = editedItem.checkOutMinute ?? editedItem.checkOutTime?.split(":")[1] ?? "00";

                                                    setEditedItem((prev) => ({
                                                        ...prev,
                                                        checkOutHour: hour,
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
                                                value={editedItem.checkOutMinute ?? (editedItem.checkOutTime?.split(":")[1] || "")}
                                                onChange={(e) => {
                                                    const minute = e.target.value;
                                                    const hour = editedItem.checkOutHour ?? editedItem.checkOutTime?.split(":")[0] ?? "00";
                                                    setEditedItem((prev) => ({
                                                        ...prev,
                                                        checkOutMinute: minute,
                                                        checkOutTime: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`,
                                                    }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">基準休憩時間</label>
                                        <div className="d-flex">
                                            <input
                                                name="breakTime"
                                                type="number"
                                                className="input me-2"
                                                value={editedItem.breakTime || ""}
                                                onChange={handleChange}
                                                placeholder="分"
                                                min="0"
                                                max="240"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">

                                {isEditing ? (
                                    <button type="submit" className="btn btn-secondary">修正する</button>
                                ) : (
                                    <button type="submit" className="btn btn-secondary">保存</button>
                                )}

                                {isEditing && (
                                    <button type="button" className="btn btn-danger" onClick={handleClick}>
                                        戻る
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
            </div>
    );
}
export default WorkScheduleDashboard;