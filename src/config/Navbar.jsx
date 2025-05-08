import React, {useEffect, useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import logoImage from '../images/loginpageLogo.png';
import {Dropdown} from "react-bootstrap";
import createAxiosInstance from "./api";
import ChangePassword from "../calcul/utils/passwordChange";

const NavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // useNavigate 훅 사용
  const { isLoggedIn, logout, role, username, expirationTime } = useAuth(); // useAuth 훅을 사용하여 로그인 상태와 logout 함수 가져오기
  const [showModal, setShowModal] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimeLeft = () => {
      if (expirationTime) {
        const remaining = parseInt(expirationTime, 10) - new Date().getTime();
        setTimeLeft(remaining > 0 ? remaining : 0);
      }
    };
    updateTimeLeft();

    // 1초마다 남은 시간 업데이트
    const intervalId = setInterval(updateTimeLeft, 1000);

    // 컴포넌트 언마운트 시 인터벌 클리어
    return () => clearInterval(intervalId);
  }, [expirationTime]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  // 메뉴 열고 닫기
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLoginLogout = () => {
    logout(); // 로그아웃 처리
    navigate("/"); // 로그인 페이지로 이동
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    if(isLoggedIn && role === "ROLE_ADMIN"){
        navigate("/main");
      setIsMenuOpen(false);
    }else {
        navigate("/main");
      setIsMenuOpen(false);
    }
  }

  const handleLinkClick = () => {
    setIsMenuOpen(false); // 메뉴 닫기
  };
  const handlePassword = (id) => {
    setEmployeeId(id); // id를 상태로 설정
    setShowModal(true); // 모달을 열기
  };

  useEffect(() => {
    const handlePasswordChange = async (event) => {
      if (event.data.type === 'changePassword') {
        const {password, id} = event.data;
        try{
          const axiosInstance = createAxiosInstance(); // 인스턴스 생성
          await axiosInstance.post('/workScheduleAdmin/password', null,{
            headers: {
              "id": id,
              "password": password,
            }
          })
          alert('パスワードが変更されました。');
          window.location.reload(); // 부모 창 새로고침
        }catch (err) {
          // console.error('비밀번호 변경 중 오류 발생:', err);
          alert('パスワードの変更中にエラーが発生しました。');
        }
      }
    };
    window.addEventListener('message', handlePasswordChange);
    return () => {
      window.removeEventListener('message', handlePasswordChange);
    };
  }, []);

    return (
        <nav className="navbar navbar-expand-lg">
          <div className="container mt-1 mb-1">
            <span className="navbar-brand"  onClick={handleLogoClick} style={{ cursor: "pointer" }}>
              <h1 className="text-dark fw-bold">
                <img src={logoImage} alt="" style={{ height: "50px" }} />
              </h1>
            </span>
              <button className="navbar-toggler " type="button" onClick={toggleMenu}>
                <span className="navbar-toggler-icon" style={{ filter: "invert(1)" }} ></span>
              </button>
              <div className={`collapse navbar-collapse ${isMenuOpen ? "show" : "close"}`} id="navbarNav">
                <ul className="navbar-nav me-auto ">
                  {isLoggedIn && role === "ROLE_ADMIN" && (
                      <>
                        <Dropdown>
                          <Dropdown.Toggle variant="link" className="nav-link text-dark fw-bold text-nowrap">
                            勤務表
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item as={Link} to="/workSchedule/main"  onClick={handleLinkClick}>勤務記録</Dropdown.Item>
                            <Dropdown.Item as={Link} to="workSchedule/list" onClick={handleLinkClick}>勤務表</Dropdown.Item>
                            <Dropdown.Item as={Link} to="workSchedule/dashBoard" onClick={handleLinkClick}>勤務表 基本情報</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                        <li className="nav-item">
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         text-nowrap"
                                to="/personnel/dashboard"
                                onClick={handleLinkClick}>인사관리</Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         text-nowrap"
                                to="/dashboard"
                                onClick={handleLinkClick}>퇴직금 현황</Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         text-nowrap"
                                to="/year/dashboard"
                                onClick={handleLinkClick}>퇴직금 검색</Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         text-nowrap"
                                to="/employee"
                                onClick={handleLinkClick}>사원 일람</Link>
                        </li>
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         text-nowrap"
                                to="/admin"
                                onClick={handleLinkClick}>관리자 페이지</Link>
                        </li>
                      </>
                  )}
                  {isLoggedIn && (role === "ROLE_TEAM" || role === "ROLE_TEAM_LEADER") && (
                      <>
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         text-nowrap"
                                to="/workSchedule/main"
                                onClick={handleLinkClick}>勤務記録</Link>
                        </li>
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         text-nowrap"
                                to="workSchedule/list"
                                onClick={handleLinkClick}>勤務表</Link>
                        </li>
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         text-nowrap"
                                to="workSchedule/dashBoard"
                                onClick={handleLinkClick}>勤務表の基本情報</Link>
                        </li>
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         text-nowrap"
                                to="/admin/list"
                                onClick={handleLinkClick}>勤務表管理</Link>
                        </li>
                      </>
                  )}
                  {isLoggedIn && role === "ROLE_GENERAL" && (
                      <>
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         text-nowrap"
                                to="workSchedule/main"
                                onClick={handleLinkClick}>勤務記録</Link>
                        </li>
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         text-nowrap"
                                to="workSchedule/list"
                                onClick={handleLinkClick}>勤務表</Link>
                        </li>
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         text-nowrap"
                                to="workSchedule/dashBoard"
                                onClick={handleLinkClick}>勤務表 基本情報</Link>
                        </li>
                      </>
                  )}
                </ul>
                <div className="d-flex justify-content-end">
                  {isLoggedIn ?
                      <>
                        <button
                            onClick={() => handlePassword(username)}
                            className="btn btn-outline-light text-dark fw-bold text-nowrap d-flex align-items-center justify-content-center"
                            type="button"
                            style={{
                              padding: '', // 기본 padding
                              fontSize: '1rem',       // 기본 텍스트 크기
                            }}
                        >パスワード変更</button>
                        {showModal && (
                            <ChangePassword
                                id={employeeId} // id를 props로 전달
                                open={showModal}
                                onOpenChange={setShowModal}
                            />
                        )}

                      </>
                      : null
                  }
                  <button className={`btn right ${isLoggedIn ? "btn-outline-light text-dark fw-bold" : "btn-primary text-white fw-bold"}` } onClick={handleLoginLogout}>
                    {isLoggedIn ?
                        <>
                          <span>
                            <i className="bi bi-alarm"></i> {minutes}:{seconds}
                          </span> <br/>
                          ログアウト
                        </>
                      : "ログイン"}
                  </button>
                </div>
              </div>
          </div>
        </nav>
  );
};
export default NavigationBar;
