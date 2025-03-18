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
  // const [username, setUsername] = useState("");
  // const [password, setPassword] = useState("");
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
    <div className="container d-flex justify-content-center align-items-center flex-column">
      <div className="row justify-content-md-center">
        <div className="col-md-14">
      <div className="card mb-3">
        <h2 className="title card-header">WEAVUS 관리자 페이지</h2>
        <button className="btn btn-info" type="button" onClick={handleGoList}> 리스트(테스트)</button>

        <table className="table card-body">
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
                      className="input"
                      value={formatAmount(employee.monthlyAmount)}
                      onChange={(e) => handleAmountChange(index, e.target.value)}
                  />
                </td>
              </tr>
          ))}
          </tbody>
        </table>
          <button className="btn btn-success card-footer" onClick={handleSave}>
            적립금 {""}
            업데이트
          </button>
      </div>
          <form onSubmit={adminSignUp} className="card ">
            <h2 className="card-header">계정 생성</h2>

            <div className="card-body">
              <label htmlFor="username" className="label">
                아이디 :
              </label>
              <input
                  name="username"
                  type="text"
                  value={item.username}
                  onChange={handleInputChange}
                  placeholder="아이디"
                  className="input mb-2"
                  required
              />
              <label htmlFor="password" className="label">
                비밀번호 :
              </label>
              <input
                  name="password"
                  type="password"
                  value={item.password}
                  onChange={handleInputChange}
                  placeholder="비밀번호"
                  className="input mb-2"
                  required
              />
              <label htmlFor="password" className="label">
                비밀번호확인 :
              </label>
              <input
                  name="password2"
                  type="password"
                  value={password2}
                  placeholder="비밀번호 확인"
                  className="input mb-2"
                  onChange={handlePassword2Change}
                  required
              />
              <label htmlFor="password" className="label">
                권한 선택 :
              </label>
              <select
                  name="role"
                  type=""
                  value={item.role}
                  onChange={handleInputChange}
                  className="input mb-2"
                  required
              >
                <option value="">권한 선택</option>
                <option value="GENERAL">일반사원</option>
                <option value="ADMIN">관리자권한</option>
                <option value="TEAM">팀장</option>
              </select>
            </div>
            <button type="submit" className="btn btn-success card-footer">생성</button>
          </form>
        </div>
      </div>
      <div>
        <button className="btn btn-success card-footer" onClick={handleMessage}>
          App 테스트 알림 발송
        </button>
      </div>
    </div>


  );
}

export default EmployeeSettings;
