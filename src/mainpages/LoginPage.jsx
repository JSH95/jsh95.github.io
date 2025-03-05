// src/mainpages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../config/AuthContext'; // AuthContext에서 useAuth 훅 가져오기
import createAxiosInstance from '../config/api';
import '../cssFiles/Login.css';
import containerImage from '../images/loginpageBackground.png';
import logoImage from '../images/loginpageLogo.png';
import usePushNotificationPermission from '../hooks/usePushNotificationPermission'; // 경로 수정

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth(); // AuthContext에서 setIsLoggedIn 가져오기
  const [remember, setRemember] = useState(false);

  usePushNotificationPermission(); // 푸시 알림 권한 요청 훅 사용

  useEffect(() => {
    const savedUsername = localStorage.getItem('savedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRemember(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    if (remember) {
      localStorage.setItem('savedUsername', username);
    } else {
      localStorage.removeItem('savedUsername');
    }
    try {
      const axiosInstance = createAxiosInstance(); // 인스턴스 생성
      const response = await axiosInstance.post('/login', {
        username,
        password,
      });
      const {
        success,
        message,
        token,
        role,
        username: responseUsername,
      } = response.data;
      if (success) {
        login(token, role, responseUsername); // 수정된 변수명 적용
        if (role === 'ROLE_ADMIN') {
          navigate('/dashboard');
        } else {
          navigate('/workSchedule/main');
        }
      } else {
        setError(message || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError('로그인에 실패했습니다. 다시 시도하세요.');
      }
    } finally {
      setIsLoading(false); // 로딩 상태 비활성화
    }
  };

  return (
    <div
      className='login_container'
      style={{ backgroundImage: `url(${containerImage})` }}
    >
      <div className='content'>
        <form onSubmit={handleLogin} className='login-box'>
          <div
            className='logo'
            style={{
              width: '', // 크기 지정
              height: '200px',
              backgroundImage: `url(${logoImage})`,
              backgroundSize: 'contain', // 크기 조정
              backgroundRepeat: 'no-repeat', // 반복 방지
              backgroundPosition: 'center', // 중앙 정렬
            }}
          />

          <div className='login-title'>Login</div>

          <div className='input-container'>
            <div className='input-label'>User ID</div>
            <div className='input-box'>
              <input
                type='text'
                id='username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete='current-password'
                placeholder='Enter your ID'
                className='input-field'
              />
            </div>
          </div>

          <div className='input-container'>
            <div className='input-label'>Password</div>
            <div className='input-box'>
              <input
                type='password'
                id='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete='current-password'
                placeholder='Enter your password'
                className='input-field'
              />
            </div>
          </div>

          <div className='checkbox-container'>
            <label className='checkbox-label'>
              <input
                type='checkbox'
                checked={remember}
                onChange={() => setRemember(!remember)}
              />{' '}
              아이디 저장
            </label>
          </div>

          <button type='submit' className='login-button' disabled={isLoading}>
            {isLoading ? 'Loading...' : '로그인'}
          </button>
          {error && <p className='error-message'>{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
