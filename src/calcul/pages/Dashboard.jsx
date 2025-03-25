import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getStateText,
  getEmployeeTypeText,
  formatAmount,
} from '../../utils/textUtils';
import '../../config/index.css';

import { useFetchAccual } from '../utils/useFetchAccual'; // 유저 정보 요청 훅
import usePushNotificationPermission from '../../hooks/usePushNotificationPermission'; // 경로 확인 후 수정

function Dashboard() {
  const navigate = useNavigate();
  const { userData, userError, userLoading } = useFetchAccual(); // 유저 정보 호출
  usePushNotificationPermission(); // 푸시 알림 토큰 가져오기

  const handleEmployeeClick = (employeeId) => {
    navigate(`/dashboard/${employeeId}`); // 상세 페이지로 이동
  };

  // 유저 정보와 연도별 데이터가 로딩되거나 에러가 발생한 경우 처리
  if (userLoading) {
    return <div className='loading'>Loading...</div>;
  }

  if (userError) {
    return <div className='error'>{userError}</div>;
  }

  return (
    <div className='container'>
      <h1 className='title'>
      {/*  {token && <div>FCM 토큰: {token}</div>} /!* 토큰을 제목 아래에 표시 *!/*/}
        퇴직금 적립 현황
      </h1>
      <div className='table-responsive'>
        <table className='table table-responsive'>
          <thead>
            <tr>
              <th className='text-center'>이름</th>
              <th className='text-center'>계약 상태</th>
              <th className='text-center'>입사일</th>
              <th className='text-center'>퇴사일</th>
              <th className='text-center'>적립 금액</th>
              <th className='text-center'>지급 상태</th>
            </tr>
          </thead>
          <tbody>
            {userData.map((item) => (
              <tr key={item.id}>
                <td className='table-data'>
                  <button
                    className='action-button'
                    onClick={() => handleEmployeeClick(item.employee.id)}
                  >
                    {item.employee.name}
                  </button>
                </td>
                <td className='table-data'>
                  {getEmployeeTypeText(
                    item.employee.employeeType,
                    item.employee.status,
                    item.employee.exitDate
                  )}
                </td>
                <td className='table-data '>{item.employee.entryDate}</td>
                <td className='table-data '>
                  {item.employee.exitDate ? item.employee.exitDate : '재직중'}
                </td>
                <td className='table-data'>
                  {formatAmount(item.totalAmount ? item.totalAmount : '0')}
                </td>
                <td className='table-data '>{getStateText(item.state)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
