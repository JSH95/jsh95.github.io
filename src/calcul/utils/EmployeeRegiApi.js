import { useState } from "react";
import createAxiosInstance from "../../config/api";

export function EmployeeRegiApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [employeeRole, setEmployeeRole] = useState(""); // 관리자 설정
  const addEmployee = async (employeeData) => {
    setLoading(true);
    setError("");
    setResponseMessage(""); // 상태 초기화
    if (employeeData.rank === "" && employeeData.employeeType === "") {
      alert("입력되지 않은 값이 있습니다. 다시 한번 확인해 주세요."); // 직급이 선택되지 않으면 경고 메시지 표시
      return;
    }

    try {
      const axiosInstance = createAxiosInstance(); // 인스턴스 생성

      const response = await axiosInstance.post("/employees", employeeData, {
        headers: {
          "Role": employeeRole,
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

  return { addEmployee, loading, error, responseMessage, setEmployeeRole, employeeRole };
}
