import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import createAxiosInstance from "../../config/api";
import "../../config/index.css";
import ListGroup from 'react-bootstrap/ListGroup';

function PersonnelInstitutionDetail() {
  const { Id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState({});


  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성
        const response = await axiosInstance.get(`/personnel/institution/${Id}`);
        setItem(response.data);
        setEditedItem(response.data);
        // console.log("데이터", response.data);
      } catch (err) {
        setError("교육 기관 정보를 불러오지 못했습니다.");
        console.error(err);
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
    const confirmSave = window.confirm("해당 교육 기관 정보를 수정하시겠습니까?");
    if (!confirmSave) {
      return;
    } else {
      try {
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성
        const response = await axiosInstance.put(
          `/personnel/institution/${Id}`,
          editedItem
        );
        setItem(response.data);
        setIsEditing(false);
        window.alert("교육 기관 정보를 수정하였습니다");
        navigate(0);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // 404 에러에 대한 처리
          window.alert("입력된 값을 다시 한번 확인해 주세요");
        } else {
          // 기타 에러에 대한 처리
          setError("교육 기관 정보를 수정하는 데 실패했습니다.");
        }
      }
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDelete = async (id) => {
      const confirmDelete = window.confirm("교육 기관을 삭제하시겠습니까?");
      if (!confirmDelete) return;
    try {
      const axiosInstance = createAxiosInstance(); // 인스턴스 생성
      const response = await axiosInstance.delete(
          `/personnel/institution/${id}`
      );
      if (response.status === 200) {
        alert("교육 기관을 성공적으로 삭제되었습니다.");
        navigate("/personnel/institution/list"); // 삭제 후 교육기관 목록 페이지로 이동
      } else if (response.status === 404) {
        alert("해당 교육 기관은 존재하지 않습니다.");
      }
    } catch (err) {
      alert("교육 기관의 삭제에 실패했습니다. 다시 한번 시도해 주세요.");
      console.error(err);
    }
  };

  const handleGoRegi = (Id) => {
    navigate(`/personnel/institution/${Id}/schedule/new`);
  };

  if (loading) return <p className="">Loading...</p>;
  if (error) return <p style={styles.errorMessage}>{error}</p>;

  function ListClicked(Id) {
    navigate(`/personnel/applicant/${Id}`);
  }

  return (
    <div className="detail-container mt-4">
      {item && (
        <div className="card">
          <div className="card-header">
            <h3>교육 기관 {item.name} 의 상세정보</h3>
          </div>
          <div className="card-body">
            {isEditing ? (
              <div>
                <div className="form-group">
                  <label className="label">기관 이름</label>
                  <div>
                    <input
                        className="input"
                            type="text"
                           name="name"
                           value={editedItem.name}
                           onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">기관 연락처</label>
                  <div>
                    <input
                        className="input"
                        type="email"
                        name="contactInfo"
                        value={editedItem.contactInfo}
                        onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">담당자</label>
                  <div>
                    <input
                        className="input"
                        type="text"
                        name="managerName"
                        value={editedItem.managerName}
                        onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">담당자 직급</label>
                  <div>
                    <input
                        className="input"
                        type="text"
                        name="position"
                        value={editedItem.position}
                        onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">교육 기관 메모</label>
                  <textarea
                      type="text"
                      name="log"
                      value={editedItem.log}
                      onChange={handleChange}
                      className="input"
                      rows="10"
                      cols="50"
                  />
                </div>
              </div>
            ) : (
              <>
                {/*<div className="form-group">*/}
                {/*  <label className="label">기관 ID</label>*/}
                {/*  <div>*/}
                {/*    {item.id}*/}
                {/*  </div>*/}
                {/*</div>*/}
                <div className="form-group">
                    <label className="label">기관명</label>
                    <div className="box">
                      <p>{item.name}</p>
                    </div>
                </div>
                <div className="form-group">
                  <label className="label">담당자 명 / 직함</label>
                  <div className="box">
                      <p>{item.managerName} {item.managerName && item.position ? "/" : "담당자를 지정해 주세요."} {item.position}</p>
                  </div>
                </div>
                <div className="form-group">
                    <label className="label">기관 연락처</label>
                    <div className="box">
                        <p>{item.contactInfo}</p>
                    </div>
                </div>
                <div className="form-group">
                    <label className="label ">소속 학생 명단 [총 인원 : {item.applicants.length}명] </label>
                  <div className="">
                    <ListGroup horizontal className="applicant-list">
                      {item.applicants.map((applicant, index) => (
                          <ListGroup.Item key={index} action onClick={() => ListClicked(applicant.id)}>
                            {applicant.name}
                            {index !== item.applicants.length - 1}
                            </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">기관 메모</label>
                  <div className="box">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{item.log}</p>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="card-footer">
            {isEditing ? (
                <button className="btn btn-primary me-2" onClick={handleSave}>
                  저장
                </button>
            ) : (
              <button className="btn btn-primary me-3" onClick={handleEditClick}>
                수정
              </button>
            )}
            {!isEditing && (
              <button
                className="btn btn-danger me-3"
                onClick={() => handleDelete(item.id)}
              >
                삭제
              </button>
            )}
            {isEditing ? (<> </>) : (
                <button
                    className="btn btn-info me-2"
                    onClick={() => handleGoRegi(item.id)}
                >일정 추가
                </button>
            )}
            <button className="btn btn-secondary me-2" onClick={handleGoBack}>
              돌아가기
            </button>
          </div>
        </div>
      )}
    </div>

  );
}
//
// const styles = {
//   container: {
//     padding: "20px",
//     max_width: "600px",
//     margin: "0 auto",
//     background: "#f9f9f9",
//   },
//   card: {
//     boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//     borderRadius: "4px",
//     overflow: "hidden",
//   },
//   cardHeader: {
//     backgroundColor: "#007bff",
//     color: "#fff",
//     padding: "10px",
//   },
//   cardBody: {
//     padding: "20px",
//   },
//   cardFooter: {
//     padding: "10px",
//     textAlign: "right",
//     borderTop: "1px solid #ddd",
//   },
//   formGroup: {
//     marginBottom: "15px",
//   },
//   label: {
//     fontWeight: "bold",
//     display: "block",
//     marginBottom: "5px",
//   },
//   input: {
//     width: "100%",
//     padding: "8px",
//     boxSizing: "border-box",
//   },
//   box: {
//     padding: "10px",
//     backgroundColor: "#f5f5f5",
//     border: "1px solid #ddd",
//     borderRadius: "4px",
//   },
//   errorMessage: {
//     color: "red",
//     textAlign: "center",
//     margin: "20px",
//   },
//   actionButton: {
//     padding: "8px 12px",
//     margin: "0 5px",
//     backgroundColor: "rgb(76, 175, 80)",
//     color: "#fff",
//     border: "none",
//     borderRadius: "4px",
//     cursor: "pointer",
//   },
//   actionButton2: {
//     padding: "8px 12px",
//     margin: "0 5px",
//     backgroundColor: "rgb(76, 175, 80)",
//     color: "#fff",
//     border: "none",
//     borderRadius: "4px",
//     cursor: "pointer",
//     display: "block",
//     marginLeft: "auto"
//   },
//   actionButtonDanger: {
//     backgroundColor: "rgb(76, 175, 80)",
//   },
// };

export default PersonnelInstitutionDetail;
