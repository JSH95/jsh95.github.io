import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import createAxiosInstance from "../../config/api";
import "../../config/index.css";
import InstitutionSchedule from "../utils/InstitutionSchedule";

function PersonneScheduleEdit() {
  const { Id } = useParams();
const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editedItem, setEditedItem] = useState({});


  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성
        const response = await axiosInstance.get(`/personnel/institution/${Id}/schedule/${scheduleId}`);
        setEditedItem(response.data);
      } catch (err) {
        setError("정보를 불러오지 못했습니다.");
        // console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonnel();
  }, [Id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault(); // 폼 제출 방지
    const confirmSave = window.confirm("해당 스케줄을 수정하시겠습니까?");
    if (!confirmSave) {
      return;
    } else {
      try {
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성
        const response = await axiosInstance.put(
          `/personnel/institution/${Id}/schedule/${scheduleId}`,
          editedItem
        );
        window.alert("지원자 정보를 수정하였습니다");
        navigate(-1);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // 404 에러에 대한 처리
          window.alert("입력된 값을 다시 한번 확인해 주세요");
        } else {
          // 기타 에러에 대한 처리
          setError("지원자 정보를 수정하는 데 실패했습니다.");
        }
      }
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) return <p style={styles.errorMessage}>Loading...</p>;
  if (error) return <p style={styles.errorMessage}>{error}</p>;

  return (
    <div className="detail-container">
      {editedItem && (
            <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3>스케쥴 {editedItem.name} 수정 페이지</h3>
          </div>
          <div style={styles.cardBody}>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>일정 이름</label>
                <input
                    name="name"
                    value={editedItem.name}
                    onChange={handleChange}
                    className="input"
                    required
                />
              </div>
              <div className="form-group">
                <label>내용</label>
                <textarea
                    type="text"
                    name="scheduleInfo"
                    value={editedItem.scheduleInfo}
                    onChange={handleChange}
                    className="input"
                    required
                />
              </div>
              <div className="form-group">
                <label>시작일, 시간</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {/* 날짜 선택 */}
                  <input
                      type="date"
                      name="startDateTime"
                      value={editedItem.startDateTime?.split("T")[0] || ""}
                      // startDateTime에서 날짜 부분만 추출
                      onChange={(e) => {
                        const dateValue = e.target.value;
                        setEditedItem((prev) => {
                          const time = prev.startDateTime?.split("T")[1] || "00:00";
                          // 기존 시간 유지 또는 기본값
                          return {
                            ...prev,
                            startDateTime: `${dateValue}T${time}`,
                            // 날짜와 기존 시간을 조합
                          };
                        });
                      }}
                      className="input"
                      required
                  />
                  {/* 시간 선택 */}
                  <input
                      type="time"
                      name="startDateTime"
                      value={editedItem.startDateTime
                          ? editedItem.startDateTime.split("T")[1].substring(0, 5) // 시:분만 추출 (초는 제외)
                          : "00:00"} // 기본값
                      onChange={(e) => {
                        const timeValue = e.target.value;
                        setEditedItem((prev) => {
                          const date = prev.startDateTime?.split("T")[0] || new Date().toISOString().split("T")[0]; // 기존 날짜 유지 또는 기본값
                          return {
                            ...prev,
                            startDateTime: `${date}T${timeValue}`, // 기존 날짜와 시간을 조합
                          };
                        });
                      }}
                      className="input"
                      required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>종료일, 시간</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {/* 날짜 선택 */}
                  <input
                      type="date"
                      name="endDateTime"
                      value={editedItem.endDateTime?.split("T")[0] || ""}
                      onChange={(e) => {
                        const dateValue = e.target.value;
                        setEditedItem((prev) => {
                          const time = prev.endDateTime?.split("T")[1] || "00:00"; // 기존 시간 유지 또는 기본값
                          return {
                            ...prev,
                            endDateTime: `${dateValue}T${time}`, // 날짜와 기존 시간을 조합
                          };
                        });
                      }}
                      className="input"
                      required
                  />
                  {/* 시간 선택 */}
                  <input
                      type="time"
                      name="endDateTime"
                      value={editedItem.endDateTime
                          ? editedItem.endDateTime.split("T")[1].substring(0, 5) // 시:분만 추출 (초는 제외)
                          : "00:00"} // 기본값
                      onChange={(e) => {
                        const timeValue = e.target.value;
                        setEditedItem((prev) => {
                          const date = prev.endDateTime?.split("T")[0] || new Date().toISOString().split("T")[0]; // 기존 날짜 유지 또는 기본값
                          return {
                            ...prev,
                            endDateTime: `${date}T${timeValue}`, // 기존 날짜와 시간을 조합
                          };
                        });
                      }}
                      className="input"
                      required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>성별</label>
                <select
                    name="scheduleType"
                    value={editedItem.scheduleType}
                    onChange={handleChange}
                    className="input"
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
      )}
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

export default PersonneScheduleEdit;
