import { useState } from "react";
import createAxiosInstance from "../../config/api";

export function EmployeeRegiApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [employeeRole, setEmployeeRole] = useState(""); // 관리자 설정
  const [teamId, setTeamId] = useState(employeeRole === "TEAM" ? "0" : ""); // 팀 아이디 설정
  const [departmentId, setDepartment] = useState(""); // 부서 설정
  const addEmployee = async (employeeData) => {
    setLoading(true);
    setError("");
    setResponseMessage(""); // 상태 초기화

    try {
      const axiosInstance = createAxiosInstance(); // 인스턴스 생성
      const response = await axiosInstance.post("/employees", employeeData, {
        headers: {
          "Role": employeeRole,
          "TeamID": teamId,
          "DepartmentId": departmentId,
        },
      });
      // 응답 데이터 설정
      setResponseMessage(response.data);
      setEmployeeRole("");
      setTeamId("");
      setDepartment("");
      window.alert("등록이 완료되었습니다.");
    } catch (err) {
      setError("등록 실패 : " + err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    addEmployee,
    loading,
    error,
    responseMessage,
    setEmployeeRole,
    employeeRole,
    setTeamId,
    teamId,
    setDepartment,
    departmentId
  };
}
