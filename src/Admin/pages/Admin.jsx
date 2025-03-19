import React, { useEffect, useState } from "react";
import "../../config/index.css";
import { getRankText, formatAmount } from "../../utils/textUtils";
import createAxiosInstance from "../../config/api";
import {useNavigate} from "react-router-dom";

const EmployeeSettings = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [password2, setPassword2] = useState("");
  const [item, setItem] = useState({
        username : "",
        password : "",
        role : "",
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성
        const response = await axiosInstance.get("/employees/admin/setting");
        setEmployees(response.data);
        setLoading(false);
      } catch (err) {
        setError("유저 정보를 불러오지 못했습니다.");
        setLoading(false);
        console.error(err); // 에러 로깅
      }
    };
    fetchEmployee();
  }, []);

  const handleAmountChange = (index, value) => {
    const updatedEmployees = [...employees];
    const numericValue = value.replace(/[^0-9]/g, "");
    updatedEmployees[index].monthlyAmount = Number(numericValue);
    setEmployees(updatedEmployees);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };
  const handlePassword2Change = (e) => {
    setPassword2(e.target.value);
  };

  const handleSave = async () => {
    try {
      const axiosInstance = createAxiosInstance(); // 인스턴스 생성
      await axiosInstance.put("/employees/admin/setting", employees);
      alert("적립금이 업데이트 되었습니다.");
    } catch (err) {
      alert("다시 한번 확인해 주세요. " + err.message);
    }
  };

  // 관리자 계정 저장하는 프로세스 생성
  const adminSignUp = async (e) => {
    e.preventDefault(); // 폼 제출 방지
    if (item.password !== password2) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
    }
    const confirmSave = window.confirm("해당 사원의 아이디를 발급하시겠습니까?");
    if (!confirmSave) {
      return;
    } else {
      try {
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성
        const response2 = await axiosInstance.post("/signup",
            item );
        const {message} = response2.data;
        window.alert(message);
        setItem({
          username : "",
          password : "",
          role : "",
        }); // 초기화
        setPassword2(""); // 초기화
      } catch (err) {
        alert("중복된 아이디 입니다. ");
      }
    }
  }


  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;


  function handleGoList() {
    navigate("/admin/list");
  }

  function handleMessage() {
    try {
      const axiosInstance = createAxiosInstance(); // 인스턴스 생성
      axiosInstance.get("/fcm/testSend");
        alert("알림이 발송되었습니다.");
    }catch (err) {
       alert("다시 한번 확인해 주세요. " + err.message);
    }
  }

  return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg mb-4">
              <h2 className="card-header text-center bg-primary text-white">WEAVUS 관리자 페이지</h2>
              <div className="card-body">
                <button className="btn btn-info w-100 mb-3" type="button" onClick={handleGoList}>
                  사원 월별 근무 그래프
                </button>

                <table className="table table-striped">
                  <thead>
                  <tr>
                    <th className="table-header">직급</th>
                    <th className="table-header">현재 월 적립 금액</th>
                  </tr>
                  </thead>
                  <tbody>
                  {employees.map((employee, index) => (
                      <tr key={index}>
                        <td className="table-data">{getRankText(employee.rank)}</td>
                        <td className="table-data">
                          <input
                              type="text"
                              className="form-control"
                              value={formatAmount(employee.monthlyAmount)}
                              onChange={(e) => handleAmountChange(index, e.target.value)}
                          />
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>

                <button className="btn btn-success w-100 mt-3" onClick={handleSave}>
                  적립금 업데이트
                </button>
              </div>
            </div>

            {/* 계정 생성 폼 */}
            <div className="card shadow-lg mb-4">
              <h2 className="card-header text-center bg-secondary text-white">계정 생성</h2>
              <form onSubmit={adminSignUp} className="card-body">
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">아이디 :</label>
                  <input
                      name="username"
                      type="text"
                      value={item.username}
                      onChange={handleInputChange}
                      placeholder="아이디"
                      className="form-control"
                      required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">비밀번호 :</label>
                  <input
                      name="password"
                      type="password"
                      value={item.password}
                      onChange={handleInputChange}
                      placeholder="비밀번호"
                      className="form-control"
                      required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">비밀번호 확인 :</label>
                  <input
                      name="password2"
                      type="password"
                      value={password2}
                      onChange={handlePassword2Change}
                      placeholder="비밀번호 확인"
                      className="form-control"
                      required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">권한 선택 :</label>
                  <select
                      name="role"
                      value={item.role}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                  >
                    <option value="">권한 선택</option>
                    <option value="GENERAL">일반사원</option>
                    <option value="ADMIN">관리자권한</option>
                    <option value="TEAM">팀장</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  계정 생성
                </button>
              </form>
            </div>

            {/* 앱 테스트 알림 발송 버튼 */}
            <div className="text-center mt-4">
              <button className="btn btn-warning" onClick={handleMessage}>
                App 테스트 알림 발송
              </button>
            </div>
          </div>
        </div>
      </div>


  );
}

export default EmployeeSettings;
