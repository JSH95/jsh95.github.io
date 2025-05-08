import React, { createContext, useContext, useState, useEffect } from "react";
import createAxiosInstance from "./api";

// 로그인 상태와 관련된 데이터를 관리할 Context 생성합니다.
const AuthContext = createContext({
  isLoggedIn: false,
  token: null,
  role: null,
  username: null,
  login: () => {},
  logout: () => {},
  extendSession: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null); // token 상태 추가
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);
  const [expirationTime, setExpirationTime] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);


  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");
    const savedUsername = localStorage.getItem("username");
    const savedExpirationTime = localStorage.getItem("expirationTime");

    if (savedToken && savedExpirationTime) {
      const currentTime = new Date().getTime();
      if (currentTime < parseInt(savedExpirationTime, 10)) {
        setIsLoggedIn(true);
        setToken(savedToken);
        setRole(savedRole);
        setUsername(savedUsername);
        setExpirationTime(savedExpirationTime);
      } else {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken, newRole, newUsername, serverTime) => {
    // const expirationTime = new Date().getTime() + 3600 * 1000; // 1시간 후
    const expirationTime = parseInt(serverTime, 10)
        // + 122 * 1000; // 서버에서 받은 시간에 10초를 더함(테스트)
        + 2 * 3600 * 1000; // 서버에서 받은 시간에 1시간을 더함
    localStorage.setItem("token", newToken); // 토큰 저장
    localStorage.setItem("role", newRole); // 역할 저장
    localStorage.setItem("username", newUsername); // 사용자 이름 저장
    localStorage.setItem("expirationTime", expirationTime); // 만료 시간 저장
    setIsLoggedIn(true);
    setToken(newToken);
    setRole(newRole);
    setUsername(newUsername);
    setExpirationTime(expirationTime);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setRole(null);
    setUsername(null);
    setExpirationTime(null);
    localStorage.removeItem("token"); // 토큰 삭제
    localStorage.removeItem("expirationTime"); // 만료 시간 삭제
    localStorage.removeItem("role");
    localStorage.removeItem("username");
  };

  // 세션 연장 함수: refresh token API를 호출하여 새로운 토큰과 만료시간을 받아옵니다.
  const extendSession = async () => {
    try {
      // refresh-token 엔드포인트 호출 (필요 시 헤더나 body 수정)
      const axiosInstance = createAxiosInstance(); // 인스턴스 생성
      const response = await axiosInstance.post(
          "/refresh-token",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          //   // 쿠키나 자격 증명을 보내야 하는 경우
          //   withCredentials: true,
          }
      );

      // 예시 응답 구조: { token, serverTime, expiresIn }
      const { token: newToken, serverTime } = response.data;

      // expiresIn이 없다면 기본적으로 2시간을 사용
      const newExpirationTime = parseInt(serverTime, 10) + 2 * 3600 * 1000;
      localStorage.setItem("token", newToken);
      localStorage.setItem("expirationTime", newExpirationTime);
      setToken(newToken);
      setExpirationTime(newExpirationTime);
    } catch (error) {
      console.error("세션 연장 실패", error);
      logout();
    }
  };

  useEffect(() => {
    let autoCloseId;
    if (showWarningModal) {
      autoCloseId = setTimeout(() => {
        setShowWarningModal(false);
        logout(); // 시간이 지났는데도 연장 안 했으면 로그아웃
      }, 30000); // 30초 대기
    }
    return () => clearTimeout(autoCloseId);
  }, [showWarningModal]);

  useEffect(() => {
    let logoutTimer;
    let warningTimer;

    if (expirationTime) {
      const timeLeft = parseInt(expirationTime, 10) - Date.now();

      if (timeLeft <= 0) {
        logout();
        return;
      }

      if (timeLeft > 120000) {
        warningTimer = setTimeout(() => {
          setShowWarningModal(true); // 2분 전 경고 모달 표시
        }, timeLeft - 120000);
      } else {
        setShowWarningModal(true); // 이미 2분 이하일 경우 바로 표시
      }

      logoutTimer = setTimeout(() => {
        logout();
      }, timeLeft);
    }

    return () => {
      clearTimeout(logoutTimer);
      clearTimeout(warningTimer);
    };
  }, [expirationTime]);


  if (loading) {
    return <div>Loading...</div>; // 초기화 중 로딩 상태 표시
  }

  return (
      <AuthContext.Provider value={{
        isLoggedIn,
        token,
        role,
        username,
        login,
        logout ,
        expirationTime,
        extendSession,
        showWarningModal,
        setShowWarningModal
      }}>
        {children}
      </AuthContext.Provider>
  );
};
