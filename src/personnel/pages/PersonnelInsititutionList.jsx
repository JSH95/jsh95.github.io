import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../config/index.css";
import createAxiosInstance from "../../config/api";

function PersonnelInsititutionList() {
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
        const response = await axiosInstance.get("/personnel/institution/list");
        if (Array.isArray(response.data)) {
          setData(response.data);
        } else {
          setError("서버에서 받은 데이터 형식이 올바르지 않습니다.");
        }
        setIsFetched(true); // 데이터 로드 완료
      } catch (error) {
        if (error.response) {
          // console.error(
          //   "서버 에러:",
          //   error.response.status,
          //   error.response.data
          // );
          setError("서버 오류가 발생했습니다.");
        } else if (error.request) {
          // console.error("응답 없음:", error.request);
          setError("서버로부터 응답이 없습니다.");
        } else {
          // console.error("요청 설정 에러:", error.message);
          setError("요청에 문제가 발생했습니다.");
        }
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchData();
  }, [isFetched]);

  const handleRowClick = () => {
    navigate(`/personnel/institution/new`);
  };

  const handleRowClick2 = () => {
    navigate(`/personnel/institution/schedule/list`);
  };

  const handleEmployeeClick = (Id) => {
    navigate(`/personnel/institution/${Id}`); // 상세 페이지로 이동
  };

  return (
    <div className="
    container
    ">
      <h1 className="title">WEAVUS 교육기관 리스트</h1>
      <div className="row align-items-end align-content-end end">
        <div className="col"></div>
        <button className="btn btn-primary me-2 col" onClick={() => handleRowClick()}>
          신규 등록
        </button>
        <button className="btn btn-success col" onClick={() => handleRowClick2()}>
          일정 관리
        </button>
      </div>
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && (
          <div className="table-responsive">
            <table className="table table-responsive">
            <thead>
              <tr>
                <th className="table-header">번호</th>
                <th className="table-header">기관 이름</th>
                <th className="table-header">담당자</th>
                <th className="table-header">총 지원자</th>
                <th className="table-header">총 합격자</th>
              </tr>
              </thead>
              <tbody>
              {data.map((institution, index) => (
                  <tr key={institution.id}>
                    <td className="table-data">
                      {index + 1}
                    </td>
                    <td className="table-data">
                      <button
                          className="action-button"
                          onClick={() => handleEmployeeClick(institution.id)} // 클릭 시 handleEmployeeClick 함수 호출
                      >
                        {institution.name}
                      </button>
                    </td>
                    <td className="table-data">
                      {institution.managerName}
                    </td>
                    <td className="table-data">
                      {institution.applicants.length} 명
                    </td>
                    <td className="table-data">
                      {
                        //학생데이터에서 admissionStatus이 불합격인사람의 수만 빼고 카운트
                        institution.applicants.filter((applicant) => applicant.admissionStatus !== "불합격").length
                      } 명
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
      )}
    </div>
  );
}

export default PersonnelInsititutionList;
