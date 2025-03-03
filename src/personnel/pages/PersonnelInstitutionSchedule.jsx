import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import createAxiosInstance from "../../config/api";
import "../../config/index.css";
import InstitutionSchedule from "../utils/InstitutionSchedule";

function PersonnelInstitutionDetail() {
  // const {Id} = useParams()
  const [item, setItem] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성
        const response = await axiosInstance.get("/personnel/institution/schedule/list");
        setItem(response.data);
      } catch (err) {
        setError("일정 정보를 불러오지 못했습니다. 새로고침 해보세요");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonnel();
  }, []);


  useEffect(() => {
    const handleDeleteRequest = async (event) => {
      if (event.data.type === 'deleteSchedule') {
        const {institutionId, scheduleId} = event.data;
        const axiosInstance = createAxiosInstance(); // 인스턴스 생성

        const response = await axiosInstance
            .delete(`/personnel/institution/${institutionId}/schedule/${scheduleId}`)
            .then(() => {
              alert('일정이 삭제되었습니다.');
              window.location.reload(); // 부모 창 새로고침
            })
            .catch((error) => {
              alert('삭제 실패: ' + error.message);
            });
      }
    };
    window.addEventListener('message', handleDeleteRequest);
    return () => {
      window.removeEventListener('message', handleDeleteRequest);
    };
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoRegi = (Id) => {
    navigate(`/personnel/institution/${Id}/schedule/new`);
  };


  if (loading) return <p >Loading...</p>;
  if (error) return <p >{error}</p>;

  return (
      <div className="container">
          <div>
            <h3 className="title">교육기관 일정 관리</h3>
          </div>
          <div className="col-12 mb-4">
            <button
                //버튼 오른쪽 끝으로 보내기
                className="btn btn-primary me-3 "
                onClick={() => handleGoRegi("new")}
            >일정 추가
            </button>
            <button
                className="btn btn-success"
                onClick={handleGoBack}>
              돌아가기
            </button>
          </div>
        <div className="row d-flex">
          <div className="col-12 ">
            <InstitutionSchedule schedules={item}/>
          </div>
        </div>
      </div>
  );
}
export default PersonnelInstitutionDetail;
