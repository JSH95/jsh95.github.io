import { useState } from "react";
import createAxiosInstance from "../../config/api";

export function useFetchYearData(year) {
  const [error, setError] = useState(""); // 에러 메시지
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [totalAccumulatedAmount, setTotalAccumulatedAmount] = useState(0); // 총 적립 금액

  const fetchDataByYear = async (year) => {
    setError(null); // 기존 에러 초기화
    if (!year || isNaN(year)) {
      setError("유효한 연도를 입력하세요.");
      return;
    }
    setLoading(true); // 로딩 시작
    // 연도별 적립 데이터 요청
    try {
      const axiosInstance = createAxiosInstance(); // 인스턴스 생성
      const response = await axiosInstance.get(
        `/employees/accruals/year/${year}`
      );

      setTotalAccumulatedAmount(response.data); // 총 적립 금액 저장
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

  return {
    error,
    loading,
    totalAccumulatedAmount,
    fetchDataByYear,
  };
}
