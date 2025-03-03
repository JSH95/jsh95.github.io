import React, { useState } from "react";
import {
  formatAmount,
} from "../../utils/textUtils";
import "../../config/index.css";
import { useFetchYearData } from "../utils/useFetchYearData"; // 연도별 데이터 요청 훅

function YearDashboard() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { error, loading, totalAccumulatedAmount, fetchDataByYear }
      = useFetchYearData(selectedYear); // 연도별 데이터 호출


  const handleChangeYear = (event) => {
    setSelectedYear(event.target.value); // 연도 변경 시 상태 업데이트
  };

  const handleSearchClick = () => {
    fetchDataByYear(selectedYear); // 연도에 맞는 데이터 요청
  };

  // 유저 정보와 연도별 데이터가 로딩되거나 에러가 발생한 경우 처리
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="container">
      <h1 className="title">WEAVUS 퇴직금 연도별 검색</h1>
      <div className="year-container">
        <label htmlFor="year" className="label">
          연도 선택:
        </label>
        <input
            id="year"
            type="number"
            value={selectedYear}
            onChange={handleChangeYear}
            min="1111"
            max="9999"
            // className="input"
        />
        <button className="submit-button" onClick={handleSearchClick}>
          검색
        </button>
      </div>
      <p className="total-amount">
        {selectedYear} 년의 적립 총액: {formatAmount(totalAccumulatedAmount)}
      </p>
    </div>
  );
}

export default YearDashboard;
