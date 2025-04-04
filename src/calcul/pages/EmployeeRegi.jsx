import React, {useEffect, useState} from "react";
import { EmployeeRegiApi } from "../utils/EmployeeRegiApi";
import "../../config/index.css";
import {TeamListApi} from "../../utils/TeamListApi";
import {DepartmentListApi} from "../../utils/DepartmentListApi";

const EmployeeRegi = () => {
  const { loadList, teamList, teErrorMsg, teLoding} = TeamListApi();
  const { deLoadList, departmentList, deErrorMsg, deLoading} = DepartmentListApi();
  const { addEmployee,
    loading,
    error,
    responseMessage,
    setEmployeeRole,
    employeeRole,
    setTeamId,
    teamId,
    setDepartment,
    departmentId
  } = EmployeeRegiApi(); // API 상태 가져오기
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    entryDate: "",
    exitDate: "",
    employeeType: "",
    conversionDate: "",
    rank: "",
    status: 0,
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    deLoadList();
  }, [deLoadList]);

  const handleChangeRole = (e) => {
    const { value } = e.target;
    setEmployeeRole(value);
  }
  const handleChangeTeam = (e) => {
    const { value } = e.target;
    setTeamId(value);
  }

  const handleChangeDepartment = (e) => {
    const { value } = e.target;
    setDepartment(value);
  }

  useEffect(() => {
    if (employeeRole === "TEAM") {
      setTeamId(0);
    }
  }, [employeeRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(employeeRole === "TEAM"){
      setTeamId(0);
    }
    await addEmployee(formData); // API 호출
    if (!error) {
      // 성공 시 폼 초기화
      setFormData({
        id: "",
        name: "",
        entryDate: "",
        exitDate: "",
        employeeType: "",
        conversionDate: "",
        rank: "",
        status: 0,
      });
      setEmployeeRole("");
      setTeamId("");
      setDepartment("");
      loadList();
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center flex-column">
      <div className="card">
        <h3 className="title card-header">사원 등록 페이지</h3>
        {error && !responseMessage && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="employee-regi-form card-body">
          <div className="form-group mb-2">
            <label className="label">ID</label>
            <input
                type="text"
                name="id"
                value={formData.id}
                onChange={(e) => {
                  const regex = /^[A-Za-z0-9]*$/;
                  if (regex.test(e.target.value) || e.target.value === "") {
                    handleChange(e); // 기존 상태 업데이트 함수 호출
                  }
                }}
                required
                placeholder="성 + 이름 스펠링 + 생일조합"
                className="input"
            />
          </div>
          <div className="form-group mb-2">
            <label>이름</label>
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="가타카나 이름"
                required
                className="input"
            />
          </div>
          <div className="form-group mb-2">
            <label>입사일</label>
            <input
                type="date"
                name="entryDate"
                value={formData.entryDate}
                onChange={handleChange}
                required
                className="input"
            />
          </div>
          <div className="form-group mb-2">
            <label>퇴사일 (선택)</label>
            <input
                type="date"
                name="exitDate"
                value={formData.exitDate}
                onChange={handleChange}
                className="input"
            />
          </div>
          <div className="form-group mb-2">
            <label>직원 유형</label>
            <select
                name="employeeType"
                value={formData.employeeType}
                onChange={handleChange}
                className="input"
                required
            >
              <option value="" disabled>
                직원 유형을 선택해 주세요
              </option>
              <option value="REGULAR">정규직</option>
              <option value="CONTRACT">계약직</option>
              <option value="OTHERS">기타</option>
            </select>
          </div>
          {formData.employeeType === "REGULAR" && (
              <div className="form-group mb-2">
                <label>전환일 (정규직만 입력)</label>
                <input
                    type="date"
                    name="conversionDate"
                    value={formData.conversionDate}
                    onChange={handleChange}
                    required
                    className="input"
                />
              </div>
          )}
          <div className="form-group mb-2">
            <label>직급</label>
            <select
                name="rank"
                value={formData.rank}
                onChange={handleChange}
                className="input"
                required
            >
              <option value="" disabled>
                직급을 선택해 주세요
              </option>
              <option value={5}>기타</option>
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
                value={departmentId}
                onChange={handleChangeDepartment}
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
          <div className="form-group mb-2">
            <label>계정 권한</label>
            <select
                value={employeeRole}
                onChange={handleChangeRole}
                className="input"
                required
            >
              <option value="" disabled>
                계정 권한을 선택해 주세요.
              </option>
              <option value="ADMIN">관리자권한</option>
              <option value="TEAM_LEADER">서브관리자권한</option>
              <option value="TEAM">팀장</option>
              <option value="GENERAL">일반사원</option>
            </select>
          </div>
          {employeeRole === "TEAM" ? null : (
            <div className="form-group">
              <label>소속 팀장</label>
                <select
                // name="institutionId"
                value={teamId}
                onChange={handleChangeTeam}
                required
                className="input"
                >
                  <option value="" disabled>
                  소속 팀장을 선택해 주세요.
                  </option>
                  {teErrorMsg ? (
                      <option value="" disabled>{teErrorMsg}</option> // 오류 메시지를 옵션으로 표시
                  ) : teamList && teamList.length > 0 ? (
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
              </select>
            </div>
          )}
          <button type="submit" disabled={loading} className="btn btn-success">
            {loading ? "등록 중..." : "직원 등록"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeRegi;
