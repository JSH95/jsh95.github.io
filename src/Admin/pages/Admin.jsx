import React, { useEffect, useState } from "react";
import "../../config/index.css";
import { getRankText, formatAmount } from "../../utils/textUtils";
import createAxiosInstance from "../../config/api";
import { useNavigate } from "react-router-dom";

const EmployeeSettings = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [password2, setPassword2] = useState("");
  const [item, setItem] = useState({
    username: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성
        const response = await axiosInstance.get("/employees/admin/setting");
        setEmployees(response.data);
        setLoading(false);
      } catch (err) {
        setError("ユーザー情報を取得できませんでした。");
        setLoading(false);
        // console.error(err); // 에러 로깅
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
      alert("積立金が更新されました。");
    } catch (err) {
      alert("もう一度ご確認ください。" + err.message);
    }
  };

  const adminSignUp = async (e) => {
    e.preventDefault(); // 폼 제출 방지
    if (item.password !== password2) {
      alert("パスワードが一致しません。");
      return;
    }
    const confirmSave = window.confirm("該当社員のIDを発行しますか？");
    if (!confirmSave) {
      return;
    } else {
      try {
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성
        const response2 = await axiosInstance.post("/signup", item);
        const { message } = response2.data;
        window.alert(message);
        setItem({
          username: "",
          password: "",
          role: "",
        }); // 초기화
        setPassword2(""); // 초기화
      } catch (err) {
        alert("重複したIDです。");
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  function handleGoList() {
    navigate("/admin/list");
  }

  function handleMessage() {
    try {
      const axiosInstance = createAxiosInstance(); // 인스턴스 생성
      axiosInstance.get("/fcm/testSend");
      alert("通知が送信されました。");
    } catch (err) {
      alert("もう一度ご確認ください。" + err.message);
    }
  }

  return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg mb-4">
              <h2 className="card-header text-center bg-primary text-white">WEAVUS 管理者ページ</h2>
              <div className="card-body">
                <button className="btn btn-info w-auto mb-3 me-4" type="button" onClick={handleGoList}>
                  社員の月次勤務グラフ
                </button>
                <button className="btn btn-warning w-auto mb-3" onClick={handleMessage}>
                  アプリテスト通知送信
                </button>
                <table className="table table-striped">
                  <thead>
                  <tr>
                    <th className="table-header">職級</th>
                    <th className="table-header">今月の積立金額</th>
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
                  積立金更新
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default EmployeeSettings;
