import React from "react";
import { useNavigate } from "react-router-dom";
import { getEmployeeTypeText } from "../../utils/textUtils";
import { useState, useEffect } from "react";
import "../../config/index.css";
import createAxiosInstance from "../../config/api";

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (isFetched) return; // 이미 호출된 경우 중단

      setLoading(true); // 로딩 시작

      try {
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성
        const response = await axiosInstance.get("/employees/lists");
        const sortedData = response.data.sort((a, b) => {
          const dateA = new Date(a.entryDate); // entryDate를 Date 객체로 변환
          const dateB = new Date(b.entryDate);
          return dateA - dateB; // 오름차순 정렬 (날짜가 오래된 순)
        });
        if (Array.isArray(sortedData)) {
          setData(sortedData);
        } else {
          setError("서버에서 받은 데이터 형식이 올바르지 않습니다.");
        }
        setIsFetched(true); // 데이터 로드 완료
      } catch (error) {
        if (error.response) {
          setError("서버 오류가 발생했습니다.");
        } else if (error.request) {
          setError("서버로부터 응답이 없습니다.");
        } else {
          setError("요청에 문제가 발생했습니다.");
        }
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchData();
  }, [isFetched]);

  const handleRowClick = () => {
    navigate(`/employee/new`);
  };

  const handleEmployeeClick = (employeeId) => {
    navigate(`/employee/${employeeId}`); // 상세 페이지로 이동
  };

  return (
      <div className="container">
          <h1 className="title text-center">WEAVUS 사원 일람</h1>
        <div className="d-flex justify-content-center align-items-center">
          <button className="btn btn-success my-2" onClick={() => handleRowClick()}>
            사원 등록
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
            <>
              <div className="table-container d-flex justify-content-center">
                <div className="table-responsive">
                  <table className="table table-striped text-center">
                    <thead>
                    <tr>
                      <th>이름</th>
                      <th>입사일</th>
                      <th>계약 상태</th>
                      <th>부서</th>
                    </tr>
                    </thead>
                    {loading && <div className="loading">Loading...</div>}
                    {!loading && !error && (
                    <tbody>
                    {data.map((employee) => (
                        <tr key={employee.id}>
                          <td className="table-data">
                            <button
                                className="action-button"
                                onClick={() => handleEmployeeClick(employee.id)}
                            >
                              {employee.name}
                            </button>
                          </td>
                          <td className="table-data">{employee.entryDate}</td>
                          <td className="table-data">
                            {getEmployeeTypeText(employee.employeeType, employee.status)}
                          </td>
                          <td className="table-data">{employee.department.name}</td>
                        </tr>
                    ))}
                    </tbody>
                    )}
                  </table>
                </div>
              </div>
            </>
      </div>

  );
}

export default EmployeeDashboard;
