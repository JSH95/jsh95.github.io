import React, { createContext, useContext, useState, useEffect } from "react";

// 로그인 상태와 관련된 데이터를 관리할 Context 생성
const AuthContext = createContext({
  isLoggedIn: false,
  token: null,
  role: null,
  username: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null); // token 상태 추가
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);
  const [expirationTime, setExpirationTime] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");
    const savedUsername = localStorage.getItem("username");
    const savedExpirationTime = localStorage.getItem("expirationTime");

    if (savedToken && savedExpirationTime) {
      const currentTime = new Date().getTime();
      if (currentTime < parseInt(savedExpirationTime)) {
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

  const login = (newToken, newRole, newUsername) => {
    const expirationTime = new Date().getTime() + 3600 * 1000; // 1시간 후
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

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (expirationTime) {
        const timeLeft = parseInt(expirationTime, 10) - new Date().getTime();
        if (timeLeft <= 0) {
          logout();
        } else {
          setTimeout(logout, timeLeft); // 남은 시간만큼 대기 후 로그아웃
        }
      }
    };

    checkTokenExpiration(); // 초기 확인

    return () => clearTimeout(); // 클린업
  }, [expirationTime]);

  if (loading) {
    return <div>Loading...</div>; // 초기화 중 로딩 상태 표시
  }

  return (
      <AuthContext.Provider value={{ isLoggedIn, token, role, username, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
};
