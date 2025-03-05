// useFetchAccual.js
import { useState, useEffect } from "react";
import createAxiosInstance from "../../config/api";

export function useFetchAccual() {
  const [userData, setUserData] = useState([]); // 유저 정보
  const [error, setError] = useState(""); // 에러 메시지
  const [loading, setLoading] = useState(false); // 로딩 상태

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // 로딩 시작
      try {
        const axiosInstance = createAxiosInstance();
        const response = await axiosInstance.get("/employees/accrual");
        const sortedData = response.data.sort((a, b) => {
          const dateA = new Date(a.employee.entryDate); // entryDate를 Date 객체로 변환
          const dateB = new Date(b.employee.entryDate);
          return dateA - dateB; // 오름차순 정렬 (날짜가 오래된 순)
        });
        setUserData(sortedData);
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
  }, []); // 컴포넌트가 마운트될 때 한 번만 호출

  return {
    userData,
    error,
    loading,
  };
}
