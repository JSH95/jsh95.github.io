import { useState } from "react";
import createAxiosInstance from "../../config/api";

export function EmployeeRegiApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [employeeRole, setEmployeeRole] = useState(""); // 관리자 설정
  const [teamId, setTeamId] = useState(employeeRole === "TEAM" ? "0" : ""); // 팀 아이디 설정
  const addEmployee = async (employeeData) => {
    setLoading(true);
    setError("");
    setResponseMessage(""); // 상태 초기화
    try {
      const axiosInstance = createAxiosInstance(); // 인스턴스 생성
      employeeRole === "TEAM" ? setTeamId("0") : null; // 팀 아이디 설정
      console.log("teamId", teamId);
      const response = await axiosInstance.post("/employees", employeeData, {
        headers: {
          "Role": employeeRole,
          "TeamID": teamId,
        },
      });
      // 응답 데이터 설정
      setResponseMessage(response.data);

      window.alert("등록이 완료되었습니다.");
    } catch (err) {
      if (err.response) {
        setError('등록 실패 : ${err.response.data.message || "서버 오류"}');
      } else if (err.request) {
        setError("등록 실패: 서버로부터 응답이 없습니다." + err.request);
      } else {
        setError("등록 실패 : ${err.message}");
      }
    } finally {
      setLoading(false);
    }
  };

  return { addEmployee,
    loading,
    error,
    responseMessage,
    setEmployeeRole,
    employeeRole,
    setTeamId,
    teamId};
}
