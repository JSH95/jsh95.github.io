import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployeeTypeText, getRankText } from "../../utils/textUtils";
import createAxiosInstance from "../../config/api";
import "../../config/index.css";
import {TeamListApi} from "../../utils/TeamListApi";
import {DepartmentListApi} from "../../utils/DepartmentListApi";
import handleChangePass from "../utils/passwordChange";
import ChangePassword from "../utils/passwordChange";


function EmployeeDetail() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState({});
  const { loadList, teamList, errorMsg} = TeamListApi();
  const { deLoadList, departmentList, deErrorMsg, deLoading} = DepartmentListApi();
  const [teamId, setTeamId] = useState(""); // 팀 아이디 설정
  const [employeeRole, setEmployeeRole] = useState(""); // 관리자 설정
  const [showModal, setShowModal] = useState(false);
  const [employeeIds, setEmployeeIds] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성
        const response = await axiosInstance.get(`/employees/${employeeId}`);
        const response2 = await axiosInstance.get(`/employees/team/${employeeId}`);
        setItem(response.data);
        setEditedItem(response.data);
        setEmployeeRole(response2.data.roles? response2.data.roles : "");
        setTeamId(response.data.team.id);
      } catch (err) {
        setError("직원 정보를 불러오지 못했습니다. \n 새로고침 해보세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    deLoadList();
  }, [deLoadList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const confirmSave = window.confirm("해당 직원을 수정하시겠습니까?");
    if (!confirmSave) {
      return;
    } else {
      const employeeDto = {
        id: editedItem.id,
        name: editedItem.name,
        entryDate: editedItem.entryDate,
        exitDate: editedItem.exitDate || null, // 퇴사일이 없을 경우 null로 처리
        employeeType: editedItem.employeeType, // 'REGULAR' 또는 'CONTRACT'
        conversionDate: editedItem.conversionDate || null, // conversionDate가 없을 경우 null
        rank: editedItem.rank,
        status: editedItem.status,
        teamId: teamId,
        departmentId: editedItem.department.id,

      };
      try {
        if (employeeDto.rank === "" || employeeDto.employeeType === "" || employeeRole === "") {
          alert("입력되지 않은 값이 있습니다. 다시 한번 확인해 주세요."); // 직급이 선택되지 않으면 경고 메시지 표시
          return;
        }
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성
        const response = await axiosInstance.put(
          `/employees/${employeeId}`,
            employeeDto , {
              headers: {
                "Role": employeeRole,
              },
            }
        );
        setItem(response.data);
        setIsEditing(false);
        window.alert("직원 수정을 완료했습니다");
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // 404 에러에 대한 처리
          window.alert("입력된 값을 다시 한번 확인해 주세요");
        } else {
          // 기타 에러에 대한 처리
          setError("직원 정보를 저장하는 데 실패했습니다." + err);
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

  //직원 삭제 시 퇴직일 여부 판단하여 삭제 진행
  const handleDelete = async (id) => {
    if (editedItem.exitDate == null) {
      const confirmDelete = window.confirm("퇴직일이 설정되 있지 않습니다. \n 퇴직일을 오늘 날짜로 설정 하시겠습니까?");
      if (!confirmDelete) return;
      editedItem.exitDate = new Date().toISOString().split("T")[0];
      await handleSave(editedItem); // 퇴직일 저장 처리
    }else {
      const confirmDelete = window.confirm("직원을 삭제하시겠습니까?");
      if (!confirmDelete) return;
    }

    try {
      const axiosInstance = createAxiosInstance(); // 인스턴스 생성
      const response = await axiosInstance.post(
          `/employees/${id}`
      );
      if (response.status === 200) {
        alert("직원이 성공적으로 삭제되었습니다.");
        navigate("/employee"); // 삭제 후 직원 목록 페이지로 이동
      } else if (response.status === 404) {
        alert("해당 직원은 존재하지 않습니다.");
      }
    } catch (err) {
      alert("직원 삭제에 실패했습니다.");
      // console.error(err);
    }
  };

  const handleChangeTeam = (e) => {
    const { value } = e.target;
    setTeamId(value);
  };

  const handleChangeRole = (e) => {
    const { value } = e.target;
    setEmployeeRole(value);
  }

  const handlePassword = (id) => {
    setEmployeeIds(id); // id를 상태로 설정
    setShowModal(true); // 모달을 열기
  };

  useEffect(() => {
    const handlePasswordChange = async (event) => {
      if (event.data.type === 'changePassword') {
        const {password, id} = event.data;
        try{
          const axiosInstance = createAxiosInstance(); // 인스턴스 생성
          await axiosInstance.post('/employees/password', null,{
                headers: {
                  "id": id,
                  "password": password,
                }
          })
            alert('비밀번호가 변경되었습니다.');
            window.location.reload(); // 부모 창 새로고침
        }catch (err) {
          // console.error('비밀번호 변경 중 오류 발생:', err);
          alert('비밀번호 변경 중 오류가 발생했습니다.');
        }
      }
    };
    window.addEventListener('message', handlePasswordChange);
    return () => {
      window.removeEventListener('message', handlePasswordChange);
    };
  }, []);

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center">
      {item && (
        <div className="card">
          <div className="card-header">
            <h3>{item.name}의 상세정보</h3>
          </div>
          <div className="card-Body">
            {isEditing ? (
              <>
                <div className="form-group">
                  <label className="label">직원 아이디</label>
                  <input
                      className="input"
                      name="id"
                      value={editedItem.id}
                      onChange={handleChange}
                      disabled
                  />
                </div>
                <div  className="form-group">
                  <label className="label">직원 이름</label>
                  <input
                      className="input"
                      name="name"
                    value={editedItem.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div  className="form-group">
                  <label className="label">입사일</label>
                  <input
                      type="date"
                      className="input"
                      name="entryDate"
                      value={editedItem.entryDate}
                      onChange={handleChange}
                      required
                  />
                </div>
                <div  className="form-group">
                  <label className="label">퇴사일</label>
                  <input
                      type="date"
                      className="input"
                      name="exitDate"
                      value={editedItem.exitDate || ""}
                      onChange={handleChange}
                  />
                </div>
                <div  className="form-group">
                  <label className="label">직원 유형</label>
                  <select
                      className="input"
                      name="employeeType"
                      value={editedItem.employeeType}
                      onChange={handleChange}
                      required
                  >
                    <option value="" disabled>직원 유형을 선택해 주세요</option>
                    <option value="CONTRACT">계약직</option>
                    <option value="REGULAR">정규직</option>
                  </select>
                </div>
                {editedItem.employeeType === "REGULAR" && (
                    <div className="form-group">
                      <label className="label">전환 날짜</label>
                      <input
                          type="date"
                          name="conversionDate"
                          value={editedItem.conversionDate|| ""}
                          onChange={handleChange}
                          required
                          className="input"
                      />
                    </div>
                )}
                <div  className="form-group">
                  <label className="label">직급</label>
                  <select
                      className="input"
                      name="rank"
                      value={editedItem.rank}
                      onChange={handleChange}
                      required
                  >
                    <option value="" disabled>직급을 선택해 주세요</option>
                    <option value={0}>사원</option>
                    <option value={1}>주임</option>
                    <option value={2}>계장</option>
                    <option value={3}>부장</option>
                    <option value={4}>사장</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>부서</label>
                  <select
                      name="department.id"
                      value={editedItem.department.id}
                      onChange={(e) =>
                          setEditedItem((prevItem) => ({
                            ...prevItem,
                            department: { ...prevItem.department, id: e.target.value }
                          }))
                      }
                      required
                      className="input"
                  >
                    <option value="" disabled>
                      소속 부서을 선택해 주세요.
                    </option>
                    {deErrorMsg ? (
                        <option value="" disabled>{deErrorMsg}</option> // 오류 메시지를 옵션으로 표시
                    ) : departmentList && departmentList.length > 0 ? (
                        departmentList.map((department) => (
                            <option key={department.id} value={department.id}>
                              {department.name}
                            </option>
                        ))
                    ) : (
                        <option value="" disabled>
                          Loading...
                        </option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label>소속 팀장</label>
                  <select
                      // name="teamId"
                      value={teamId}
                      onChange={handleChangeTeam}
                      required
                      className="input"
                  >
                    {errorMsg ? (
                        <option value="" disabled>{errorMsg}</option> // 오류 메시지를 옵션으로 표시
                    ) :
                        <>
                            <option value="" disabled>소속 팀장을 선택해 주세요.</option>
                            {teamList && teamList.length > 0 ? (
                          teamList.map((team) => (
                            <option key={team.id} value={team.id}>
                              {team.teamLeaderName === "adminname" ? "미정" : team.teamLeaderName}
                            </option>
                          ))
                          ) : (
                            <option value="" disabled>
                              Loading...
                            </option>
                          )}
                        </>
                        }
                  </select>
                </div>
                <div  className="form-group">
                  <label className="label">계정 권한</label>
                  <select
                      className="input"
                      value={employeeRole}
                      onChange={handleChangeRole}
                      required
                  >
                    <option value="" disabled>계정 권한을 선택해 주세요</option>
                    <option value="ADMIN">관리자권한</option>
                    <option value="TEAM_LEADER">서브관리자권한</option>
                    <option value="TEAM">팀장</option>
                    <option value="GENERAL">일반사원</option>
                   
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="card-body">
                  <div className="form-group mb-1">
                    <label className="label">직원 아이디</label>
                      <p className="box">{item.id}</p>
                  </div>
                  <div  className="form-group mb-1">
                    <label className="label">직원 이름</label>
                      <p className="box">{item.name}</p>
                  </div>
                  <div  className="form-group mb-1">
                    <label className="label">입사일</label>
                    <div >
                      <p className="box">{item.entryDate}</p>
                    </div>
                  </div>
                  <div  className="form-group mb-1">
                    <label className="label">퇴사일</label>
                      <p className="box">{item.exitDate ? item.exitDate : "재직중"}</p>
                  </div>
                  <div  className="form-group mb-1">
                    <label className="label">계약 상태</label>
                      <p className="box">
                        {" "}
                        {getEmployeeTypeText(item.employeeType, item.status)}
                      </p>
                  </div>
                  <div  className="form-group mb-1">
                    <label className="label">전환 날짜</label>
                      <p className="box">{item.conversionDate ? item.conversionDate : "없음"}</p>
                  </div>
                  <div  className="form-group mb-1">
                    <label className="label">직급</label>
                      <p  className="box">{getRankText(item.rank)}</p>
                  </div>
                  <div  className="form-group mb-1">
                    <label className="label">부서</label>
                    <p  className="box">{item.department.name}</p>
                  </div>
                  <div className="form-group mb-1">
                    <label className="label">소속 팀장</label>
                    <div>
                      {item.id === item.team.teamLeaderId ? (
                          <p className="box">팀장</p>
                      ) : item.team.teamLeaderId === null || item.team.teamLeaderId === "admin" ? (
                          <p className="box">팀이 정해지지 않았습니다.</p>
                      ) : (
                          <p className="box">{item.team.teamLeaderName}</p>
                      )}
                    </div>
                  </div>
                  <div className="form-group mb-1">
                    <button className="btn btn-primary" type="button" onClick={() => handlePassword(item.id)}>비밀번호 변경</button>
                    {showModal && (
                        <ChangePassword
                            id={employeeId} // id를 props로 전달
                            open={showModal}
                            onOpenChange={setShowModal}
                        />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="card-footer">
            {isEditing ? (
              <button className="btn btn-primary me-3" onClick={handleSave}>
                저장
              </button>
            ) : (
              <button className="btn btn-primary me-3" onClick={handleEditClick}>
                수정
              </button>
            )}
            {!isEditing && (
              <button
                  className="btn btn-danger me-2"
                onClick={() => handleDelete(item.id)}
              >삭제</button>
            )}
            <button className="btn btn-secondary" onClick={handleGoBack}>
              돌아가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeDetail;
