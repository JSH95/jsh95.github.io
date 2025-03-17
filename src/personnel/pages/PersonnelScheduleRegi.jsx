import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import createAxiosInstance from "../../config/api";
import "../../config/index.css";
import {InstitutionListApi} from "../utils/InstitutionListApi";

function PersonneScheduleRegi() {
  const { Id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    institutionId: null, // 초기 값 설정
  });
  const { loadList, institutionList} = InstitutionListApi();


  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleSave = async (e) => {
    e.preventDefault(); // 폼 제출 방지
    const confirmSave = window.confirm("해당 일정을 추가하시겠습니까?");
    if (!confirmSave) {
      return;
    } else {
      setLoading(true);
      setError("");
      try {
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성

        const institutionId = Id === "new" ? formData.institutionId : Id;
        if (!institutionId) {
          window.alert("소속 기관을 선택해 주세요.");
          setLoading(false);
          return;
        }

        const response = await axiosInstance.post(
            `/personnel/institution/${institutionId}/schedule/add`,
            formData
        );
        window.alert("일정을 추가 하였습니다");
        setFormData({ institutionId: Id || "" }); // 초기 상태로 리셋
        navigate(-1);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // 404 에러에 대한 처리
          window.alert("입력된 값을 다시 한번 확인해 주세요");
        } else {
          // 기타 에러에 대한 처리
          setError("일정을 추가하는데 실패했습니다.");
        }
      }
      finally {
        setLoading(false);
      }
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };

  const handleDateChange = (e, type) => {
    const dateValue = e.target.value;
    setFormData((prev) => {
      const time = prev[type]?.split("T")[1] || "00:00"; // 기존 시간 유지 또는 기본값
      return {
        ...prev,
        [type]: `${dateValue}T${time}`, // 날짜와 기존 시간을 조합
      };
    });
  };

  const handleTimeChange = (e, type) => {
    const timeValue = e.target.value;
    setFormData((prev) => {
      const date = prev[type]?.split("T")[0] || new Date().toISOString().split("T")[0]; // 기존 날짜 유지 또는 기본값
      return {
        ...prev,
        [type]: `${date}T${timeValue}`, // 날짜와 시간을 조합
      };
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) return <p style={styles.errorMessage}>Loading...</p>;
  if (error) return <p style={styles.errorMessage}>{error}</p>;

  return (
      <div className="detail-container">
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3>스케쥴 신규 추가 페이지</h3>
          </div>
          <div style={styles.cardBody}>
            <form onSubmit={handleSave}>
              {Id === "new" && (
                  <div className="form-group">
                    <label>소속 기관</label>
                    <select
                        name="institutionId"
                        value={formData.institutionId || ""}
                        onChange={handleChange}
                        required
                        className="input"
                    >
                      <option value="" disabled>
                        소속 기관을 선택해 주세요
                      </option>
                      {institutionList && institutionList.length > 0 ? (
                          institutionList.map((institution) => (
                              <option key={institution.id} value={institution.id}>
                                {institution.name}
                              </option>
                          ))
                      ) : (
                          <option value="" disabled>
                            Loading...
                          </option>
                      )}
                    </select>
                  </div>
              )}
              <div className="form-group">
                <label>일정 이름</label>
                <input
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    className="input"
                    required
                />
              </div>
              <div className="form-group">
                <label>내용</label>
                <textarea
                    type="text"
                    value={formData.scheduleInfo || ""}
                    name="scheduleInfo"
                    onChange={handleChange}
                    className="input"
                    required
                />
              </div>
              <div className="form-group">
                <label>시작일, 시간</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                      type="date"
                      name="startDateTime"
                      value={formData.startDateTime?.split("T")[0] || ""}
                      onChange={(e) => handleDateChange(e, "startDateTime")}
                      className="input"
                      required
                  />
                  <input
                      type="time"
                      name="startDateTime"
                      value={formData.startDateTime?.split("T")[1] || ""}
                      onChange={(e) => handleTimeChange(e, "startDateTime")}
                      className="input"
                      required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>종료일, 시간</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                      type="date"
                      name="endDateTime"
                      value={formData.endDateTime?.split("T")[0] || ""}
                      onChange={(e) => handleDateChange(e, "endDateTime")}
                      className="input"
                      required
                  />
                  <input
                      type="time"
                      name="endDateTime"
                      value={formData.endDateTime?.split("T")[1] || ""}
                      onChange={(e) => handleTimeChange(e, "endDateTime")}
                      className="input"
                      required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>일정 종류</label>
                <select
                    name="scheduleType"
                    onChange={handleChange}
                    className="input"
                    value={formData.scheduleType || ""}
                    required
                >
                  <option value="" disabled>
                    일정 종류를 선택해 주세요
                  </option>
                  <option value="면접">면접</option>
                  <option value="기관">기관</option>
                  <option value="이벤트">이벤트</option>
                  <option value="기타">기타</option>
                  <option value="회계">회계</option>
                </select>
              </div>
              <button type="submit" className="submit-button">
                저장
              </button>
            </form>
            <button className="submit-button" onClick={handleGoBack}>
              돌아가기
            </button>
          </div>
        </div>
      </div>
  );
}


const styles = {
  container: {
    padding: "20px",
    max_width: "600px",
    margin: "0 auto",
    background: "#f9f9f9",
  },
  card: {
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    borderRadius: "4px",
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "10px",
  },
  cardBody: {
    padding: "20px",
  },
  cardFooter: {
    padding: "10px",
    textAlign: "right",
    borderTop: "1px solid #ddd",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    fontWeight: "bold",
    display: "block",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "8px",
    boxSizing: "border-box",
  },
  box: {
    padding: "10px",
    backgroundColor: "#f5f5f5",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  errorMessage: {
    color: "red",
    textAlign: "center",
    margin: "20px",
  },
  actionButton: {
    padding: "8px 12px",
    margin: "0 5px",
    backgroundColor: "rgb(76, 175, 80)",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  actionButton2: {
    padding: "8px 12px",
    margin: "0 5px",
    backgroundColor: "rgb(76, 175, 80)",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    display: "block",
    marginLeft: "auto"
  },
  actionButtonDanger: {
    backgroundColor: "rgb(76, 175, 80)",
  },
};

export default PersonneScheduleRegi;
