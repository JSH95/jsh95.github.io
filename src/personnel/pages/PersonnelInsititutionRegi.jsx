import React, { useState} from "react";
import "../../config/index.css";
import createAxiosInstance from "../../config/api";
import {useNavigate} from "react-router-dom";

function PersonnelRegi() {
  const [formData, setFormData] = useState({
    name: "",
    contactInfo: "",
    managerName: "",
    position: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 제출 동작 방지
    const confirmSave = window.confirm("해당 교육기관을 저장 하시겠습니까?");
      if (!confirmSave) {
        return;
      }
      setLoading(true);
      setError("");
      try {
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성
        const response = await axiosInstance.post("personnel/institution/add", formData);
        window.alert("교육기관을 추가하였습니다");
        setFormData({
          name: "",
          contactInfo: "",
          managerName: "",
          position: "",
        });
        navigate(-1);
      } catch (err) {
        if (err.response) {
          setError("등록 실패 : 기관명을 다시 확인해 주세요}" + err.response);
        } else if (err.request) {
          setError("등록 실패 다시 시도해 주세요" + err.request);
        }
      }
      finally {
        setLoading(false);
      }
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
      <div className="container d-flex justify-content-center align-items-center flex-column">
      <h2 className="title">교육 기관 등록 페이지</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
      <div className="form-group">
          <label>이름</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input"
          />
       </div>
        <div className="form-group">
          <label>연락처</label>
          <input
              type="email"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              required
              className="input"
          />
        </div>
        <div className="form-group">
          <label>담당자</label>
          <input
              type="text"
              name="managerName"
              value={formData.managerName}
              onChange={handleChange}
              required
              className="input"
          />
        </div>
        <div className="form-group">
          <label>직함</label>
          <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
              className="input"
          />
        </div>
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "등록 중..." : "등록"}
        </button>
      </form>
    </div>
  );
};

export default PersonnelRegi;
