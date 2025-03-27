import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import createAxiosInstance from "../../config/api";
import "../../config/index.css";
import {InstitutionListApi} from "../utils/InstitutionListApi";
import {FileUploadDownload} from "./PersonnelFile";
import {ProgressBar} from "react-bootstrap";
import dayjs from "dayjs";
import {useAuth} from "../../config/AuthContext"; // dayjs 라이브러리 사용 (설치 필요: npm install dayjs)

function PersonnelDetail() {
  const { Id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState({
    applicantFile: [], // 초기값을 빈 배열로 설정
  });
  const { loadList, institutionList} = InstitutionListApi();

  const {
    uploading, progress, downloading ,handleUpload, handleDownload, handleFileChange, files, fileDelete
  } = FileUploadDownload(editedItem, setEditedItem);

  const calculateAge = (birthDate) => {
    if (!birthDate) return "-";

    const today = dayjs(); // 오늘 날짜
    const birth = dayjs(birthDate); // 생년월일
    return today.diff(birth, "year"); // 만 나이 계산
  };


  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성
        const response = await axiosInstance.get(`/personnel/applicant/${Id}`);
        setItem(response.data);
        setEditedItem(response.data);
      } catch (err) {
        setError("지원자 정보를 불러오지 못했습니다.");
        // console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonnel();
  }, [Id]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault(); // 폼 제출 방지
    const confirmSave = window.confirm("해당 지원자를 수정하시겠습니까?");
    if (!confirmSave) {
      return;
    } else {
      try {
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성
        const response = await axiosInstance.put(
          `/personnel/applicant/${Id}`,
          editedItem
        );
        setItem(response.data);
        setIsEditing(false);
        window.alert("지원자 정보를 수정하였습니다");
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

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDelete = async (id) => {
      const confirmDelete = window.confirm("지원자를 삭제하시겠습니까?");
      if (!confirmDelete) return;
    try {
      const axiosInstance = createAxiosInstance(); // 인스턴스 생성
      const response = await axiosInstance.delete(
          `/personnel/applicant/${id}`
      );
      if (response.status === 200) {
        alert("지원자가 성공적으로 삭제되었습니다.");
        navigate("/personnel/dashboard"); // 삭제 후 지원자 목록 페이지로 이동
      } else if (response.status === 404) {
        alert("해당 지원자는 존재하지 않습니다.");
      }
    } catch (err) {
      alert("지원자 삭제에 실패했습니다.");
      // console.error(err);
    }
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
      <div className="container d-flex justify-content-center align-items-center flex-column">
        {item && (
            <div className="card">
              <div className="card-header">
                <h3>지원자 {item.name} 의 상세정보</h3>
              </div>
              <div className="card-body">

                {isEditing ? (
                    <div>
                      <div>
                        <input
                            className="form-control mb-2"
                            name="id"
                            value={editedItem.id}
                            onChange={handleChange}
                            disabled
                            hidden
                        />
                      </div>
                      <div className="form-group mb-2">
                        <label className="label">지원자 이름</label>
                        <input
                            className="form-control"
                            name="name"
                            value={editedItem.name}
                            onChange={handleChange}
                            required
                        />
                      </div>
                      <div className="form-group mb-2">
                        <label className="label">성별</label>
                        <select
                            className="form-control"
                            name="gender"
                            value={editedItem.gender}
                            onChange={handleChange}
                            required
                        >
                          <option value="" disabled>
                            성별을 선택해 주세요
                          </option>
                          <option value="남성">남성</option>
                          <option value="여성">여성</option>
                        </select>
                      </div>
                      <div className="form-group mb-2">
                        <h5>email</h5>
                        <input
                            className="form-control"
                            type="email"
                            name="email"
                            value={editedItem.email}
                            onChange={handleChange}
                            required
                        />
                      </div>
                      <div className="form-group mb-2">
                        <h5>생년월일</h5>
                        <input
                            type="date"
                            className="form-control"
                            name="birthDate"
                            value={editedItem.birthDate || ""}
                            onChange={handleChange}
                            required
                        />
                      </div>
                      <div className="form-group mb-2">
                        <h5>전화번호</h5>
                        <input
                            type="tel"
                            className="form-control"
                            name="phoneNumber"
                            value={editedItem.phoneNumber}
                            onChange={handleChange}
                        />
                      </div>
                      <div className="form-group mb-2">
                        <h5>소속 기관</h5>
                        <select
                            className="form-control"
                            name="institutionId"
                            value={editedItem.institutionId || ""}
                            onChange={handleChange}
                            required
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
                      <div className="form-group mb-2">
                        <h5>지원 날짜</h5>
                        <input
                            type="date"
                            className="form-control"
                            name="joiningDate"
                            value={editedItem.joiningDate || ""}
                            onChange={handleChange}
                            required
                        />
                      </div>
                      <div className="form-group mb-2">
                        <h5>지원 상태</h5>
                        <select
                            className="form-control"
                            name="admissionStatus"
                            value={editedItem.admissionStatus}
                            onChange={handleChange}
                            required
                        >
                          <option value="" disabled>
                            해당하는 지원상태를 선택해 주세요.
                          </option>
                          <option value="지원중">지원중</option>
                          <option value="일차합격">일차합격</option>
                          <option value="이차합격">이차합격</option>
                          <option value="내정중">내정중</option>
                          <option value="내정확정">내정확정</option>
                          <option value="최종합격">최종합격</option>
                          <option value="불합격">불합격</option>
                          <option value="보류">보류</option>
                        </select>
                      </div>
                      <div className="form-group mb-2">
                        <h5>지원자 메모</h5>
                        <textarea
                            className="form-control  my-3 mt-1"
                            name="log"
                            value={editedItem.log}
                            onChange={handleChange}
                            rows="10"
                            style={{ whiteSpace: 'pre-wrap' }}
                        />
                      </div>
                      <div>
                        <h5>파일 업로드</h5>
                        <div>
                          <input
                              className="form-control "
                              id="file-upload-type2"
                              type="file"
                              accept=".jpg,.png,.pdf,.docx,.doc"
                              onChange={(e) => handleFileChange(e, "resumeFileName1")}
                          />
                          <div>
                            {["resumeFileName1"].map((resumeType, index) => {
                              const file = editedItem.applicantFile?.find((file) => file.resumeType === resumeType);

                              if (file) {
                                return (
                                    <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span>{file.fileName}</span>
                                      <button className="btn btn-primary my-3" onClick={() => fileDelete(file.id)}>삭제</button>
                                    </div>
                                );
                              }
                              return <p key={index}>파일이 없습니다.</p>;
                            })}
                          </div>
                        </div>
                        <div>
                          <input
                              id="file-upload-type2"
                              className="form-control"
                              type="file"
                              accept=".jpg,.png,.pdf,.docx,.doc"
                              onChange={(e) => handleFileChange(e, "resumeFileName2")} // 파일을 처리하는 함수
                          />
                          <div>
                            {["resumeFileName2"].map((resumeType, index) => {
                              const file = editedItem.applicantFile?.find((file) => file.resumeType === resumeType);
                              if (file) {
                                return (
                                    <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span>{file.fileName}</span>
                                      <button className="btn btn-primary my-3" onClick={() => fileDelete(file.id)}>삭제</button>
                                    </div>
                                );
                              }
                              return <p key={index}>파일이 없습니다.</p>;
                            })}
                          </div>
                        </div>
                        <div>
                          <input
                              id="file-upload-type3 "
                              className="form-control"
                              type="file"
                              accept=".jpg,.png,.pdf,.docx,.doc"
                              onChange={(e) => handleFileChange(e, "resumeFileName3")} // 파일을 처리하는 함수
                          />
                          <div>
                            {["resumeFileName3"].map((resumeType, index) => {
                              const file = editedItem.applicantFile?.find(
                                  (file) => file.resumeType === resumeType
                              );
                              if (file) {
                                return (
                                    <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span>{file.fileName}</span>
                                      <button className="btn btn-primary my-3" onClick={() => fileDelete(file.id)}>삭제</button>
                                    </div>
                                );
                              }
                              return <p key={index}>파일이 없습니다.</p>;
                            })}
                          </div>
                        </div>
                        <div style={{ marginTop: "20px" }}>
                          {uploading && (
                              <div style={{ marginBottom: "10px" }}>
                                <p>업로드 진행 중: {progress}%</p>
                                <div
                                    style={{
                                      width: "100%",
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
                          <button
                              onClick={handleUpload}
                              disabled={uploading || files.length === 0}
                              className="btn btn-primary"
                          >
                            {uploading ? "업로드 중..." : "업로드"}
                          </button>
                        </div>
                      </div>
                    </div>
                ) : (
                    <div className="card-body">
                      <div className="form-group">
                        <label className="label">지원자 이름</label>
                        <p className="box">{item.name}</p>
                      </div>
                      <div className="form-group">
                        <label className="label">성별</label>
                        <p className="box">{item.gender}</p>
                      </div>
                      <div className="form-group mb-2">
                        <label className="label">생년월일 </label>
                        <p className="box">{item.birthDate}</p>
                      </div>
                      <div className="form-group mb-2">
                        <label className="label">나이</label>
                        <p className="box">만 {calculateAge(item.birthDate)}세</p>
                      </div>
                      <div className="form-group mb-2">
                        <label className="label">email</label>
                        <p className="box">{item.email}</p>
                      </div>
                      <div className="form-group mb-2">
                        <label className="label">전화번호</label>
                        <p className="box">{item.phoneNumber}</p>
                      </div>
                      <div className="form-group mb-2">
                        <label className="label">소속 기관</label>
                        <p className="box">{item.institution.name}</p>
                      </div>
                      <div className="form-group mb-2">
                        <label className="label">지원 날짜</label>
                        <p className="box">{item.joiningDate}</p>
                      </div>
                      <div className="form-group mb-2">
                        <label className="label">지원 상태</label>
                        <p className="box">{item.admissionStatus}</p>
                      </div>
                      <div className="form-group mb-2">
                        <label className="label">지원자 메모</label>
                        <p className="box" style={{ whiteSpace: 'pre-wrap' }}>{item?.log ? item.log : "메모가 없습니다."}</p>
                      </div>
                      {["resumeFileName1"].map((resumeType, index) => {
                        const file = editedItem.applicantFile?.find(
                            (file) => file.resumeType === resumeType
                        );
                        if (file) {
                          return (
                              <div className="form-group mb-2">
                                <label className="label">이력서 다운로드</label>
                                <div >
                                  <button
                                      onClick={handleDownload}
                                      disabled={downloading}
                                      className="btn btn-primary"
                                  >
                                    {downloading ? "다운로드 중..." : "다운로드"}
                                  </button>
                                  {downloading ?<ProgressBar now={progress} label={`${progress}%`} /> : <> </>}
                                </div>
                              </div>
                          );
                        }
                        return <p key={index}>파일이 없습니다.</p>;
                      })}
                    </div>
                )}
              </div>
              <div className="card-footer">
                {isEditing ? (
                    <button
                        onClick={handleSave}
                        className="btn btn-success me-2"
                    >
                      저장
                    </button>
                ) : (
                    <button
                        onClick={handleEditClick}
                        className="btn btn-primary me-3"
                    >
                      수정
                    </button>
                )}
                {!isEditing && (
                    <button
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-danger me-2"
                    >
                      삭제
                    </button>
                )}
                <button
                    onClick={handleGoBack}
                    className="btn btn-secondary me-2"
                >
                  돌아가기
                </button>
              </div>
              <div>

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

export default PersonnelDetail;
