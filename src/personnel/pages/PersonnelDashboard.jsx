<<<<<<< HEAD
import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../config/index.css";
import createAxiosInstance from "../../config/api";
import {Dropdown} from "react-bootstrap";

function PersonnelDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [showAll, setShowAll] = useState(false); // 기본값은 false (불합격자 숨김)

  useEffect(() => {
    const fetchData = async () => {
      if (isFetched) return; // 이미 호출된 경우 중단

      setLoading(true); // 로딩 시작

      try {
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성
        const response = await axiosInstance.get("/personnel/applicant/list");
        if (Array.isArray(response.data)) {
          setData(response.data);
        } else {
          setError("서버에서 받은 데이터 형식이 올바르지 않습니다.");
        }
        setIsFetched(true); // 데이터 로드 완료
      } catch (error) {
        if (error.response) {
          console.error(
            "서버 에러:",
            error.response.status,
            error.response.data
          );
          setError("서버 오류가 발생했습니다.");
        } else if (error.request) {
          console.error("응답 없음:", error.request);
          setError("서버로부터 응답이 없습니다.");
        } else {
          console.error("요청 설정 에러:", error.message);
          setError("요청에 문제가 발생했습니다.");
        }
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchData();
  }, [isFetched]);

  const handleRowClick = () => {
    navigate(`/personnel/applicant/new`);
  };

  const handleRowClick2 = () => {
    navigate(`/personnel/institution/list`);
  };

  const handleEmployeeClick = (Id) => {
    navigate(`/personnel/applicant/${Id}`); // 상세 페이지로 이동
  };
//

  return (
    <div className="container">
      <h1 className="title">WEAVUS 지원자 리스트</h1>
      <div className="row">
        <Dropdown className="dropdown mb-3">
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            합격여부
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item  onClick={() => setShowAll(false)}>불합격자 숨기기</Dropdown.Item>
            <Dropdown.Item onClick={() => setShowAll(true)}>모두 보기</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <button className="btn btn-success col me-2" onClick={() => handleRowClick()}>
          지원자 등록
        </button>
        <button className="btn btn-primary col" onClick={() => handleRowClick2()}>
          기관 목록
        </button>
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && (
          <div className="table-responsive">
            <table className="table table-responsive">
              <thead>
              <tr>
                <th className="table-header">이름</th>
                <th className="table-header">성별</th>
                <th className="table-header">교육기관</th>
                <th className="table-header">지원 상태</th>
                <th className="table-header">상태 경과일</th>
              </tr>
              </thead>
              <tbody>
              {data
                  .filter(applicant => showAll || applicant.admissionStatus !== "불합격") // 불합격자 필터링
                  .map((applicant) => (
                      <tr key={applicant.id}>
                        <td className="table-data">
                          <button
                              className="action-button"
                              style={{
                                backgroundColor: applicant.admissionStatus === "불합격"
                                    ? "#BDBDBD"
                                    : applicant.gender === "남성"
                                        ? "#64B5F6"
                                        : "#E57373"
                              }}
                              onClick={() => handleEmployeeClick(applicant.id)} // 클릭 시 handleEmployeeClick 함수 호출
                          >
                            {applicant.name}
                          </button>
                        </td>
                        <td className="table-data">
                          {applicant.gender}
                        </td>
                        <td className="table-data">
                          {applicant.institution.name}
                        </td>
                        <td className="table-data">
                          {applicant.admissionStatus}
                        </td>
                        <td className="table-data">
                          D +{applicant.statusDate}일
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

export default PersonnelDashboard;
=======
import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../config/index.css";
import createAxiosInstance from "../../config/api";
import {Dropdown} from "react-bootstrap";

function PersonnelDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [showAll, setShowAll] = useState(false); // 기본값은 false (불합격자 숨김)

  useEffect(() => {
    const fetchData = async () => {
      if (isFetched) return; // 이미 호출된 경우 중단

      setLoading(true); // 로딩 시작

      try {
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성
        const response = await axiosInstance.get("/personnel/applicant/list");
        if (Array.isArray(response.data)) {
          setData(response.data);
        } else {
          setError("서버에서 받은 데이터 형식이 올바르지 않습니다.");
        }
        setIsFetched(true); // 데이터 로드 완료
      } catch (error) {
        if (error.response) {
          console.error(
            "서버 에러:",
            error.response.status,
            error.response.data
          );
          setError("서버 오류가 발생했습니다.");
        } else if (error.request) {
          console.error("응답 없음:", error.request);
          setError("서버로부터 응답이 없습니다.");
        } else {
          console.error("요청 설정 에러:", error.message);
          setError("요청에 문제가 발생했습니다.");
        }
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchData();
  }, [isFetched]);

  const handleRowClick = () => {
    navigate(`/personnel/applicant/new`);
  };

  const handleRowClick2 = () => {
    navigate(`/personnel/institution/list`);
  };

  const handleEmployeeClick = (Id) => {
    navigate(`/personnel/applicant/${Id}`); // 상세 페이지로 이동
  };
//

  return (
    <div className="container">
      <h1 className="title">WEAVUS 지원자 리스트</h1>
      <div className="row align-items-center">
        <div className="d-flex gap-2 w-100">
        <Dropdown className="dropdown mb-2">
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            합격여부
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item  onClick={() => setShowAll(false)}>불합격자 숨기기</Dropdown.Item>
            <Dropdown.Item onClick={() => setShowAll(true)}>모두 보기</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
          <div className="ms-auto">
            <button className="btn btn-success me-2" onClick={() => handleRowClick()}>
              지원자 등록
            </button>
            <button className="btn btn-primary " onClick={() => handleRowClick2()}>
              기관 목록
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && (
          <div className="table-responsive">
            <table className="table table-responsive">
              <thead>
              <tr>
                <th className="table-header">이름</th>
                <th className="table-header">성별</th>
                <th className="table-header">교육기관</th>
                <th className="table-header">지원 상태</th>
                <th className="table-header">상태 경과일</th>
              </tr>
              </thead>
              <tbody>
              {data
                  .filter(applicant => showAll || applicant.admissionStatus !== "불합격") // 불합격자 필터링
                  .map((applicant) => (
                      <tr key={applicant.id}>
                        <td className="table-data">
                          <button
                              className="action-button"
                              style={{
                                backgroundColor: applicant.admissionStatus === "불합격"
                                    ? "#BDBDBD"
                                    : applicant.gender === "남성"
                                        ? "#64B5F6"
                                        : "#E57373"
                              }}
                              onClick={() => handleEmployeeClick(applicant.id)} // 클릭 시 handleEmployeeClick 함수 호출
                          >
                            {applicant.name}
                          </button>
                        </td>
                        <td className="table-data">
                          {applicant.gender}
                        </td>
                        <td className="table-data">
                          {applicant.institution.name}
                        </td>
                        <td className="table-data">
                          {applicant.admissionStatus}
                        </td>
                        <td className="table-data">
                          D +{applicant.statusDate}일
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

export default PersonnelDashboard;
>>>>>>> 03d9d303edd2c7d9d03859917d2ad2f945628a4d
