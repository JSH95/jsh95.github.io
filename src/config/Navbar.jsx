import React, {useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import logoImage from '../images/loginpageLogo.png';
import {Dropdown} from "react-bootstrap";

// 메뉴바 컴포넌트
const NavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // useNavigate 훅 사용
  const { isLoggedIn, logout, role } = useAuth(); // useAuth 훅을 사용하여 로그인 상태와 logout 함수 가져오기
 //

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
        navigate("/dashboard");
      setIsMenuOpen(false);
    }else {
        navigate("/workSchedule/list");
      setIsMenuOpen(false);
    }
  }

  const handleLinkClick = () => {
    setIsMenuOpen(false); // 메뉴 닫기
  };

    return (
        <nav className="navbar navbar-expand-lg bg-white fixed-top">
          <div className="container mt-1 mb-1 py-0 px-5 ">
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
                          <Dropdown.Toggle variant="link" className="nav-link text-dark fw-bold">
                            근무표
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item as={Link} to="/workSchedule/main">근무기록</Dropdown.Item>
                            <Dropdown.Item as={Link} to="workSchedule/list">근무표 일람</Dropdown.Item>
                            <Dropdown.Item as={Link} to="workSchedule/dashBoard">MyPage</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                        <li className="nav-item">
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         "
                                to="/personnel/dashboard"
                                onClick={handleLinkClick}>인사관리</Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         "
                                to="/dashboard"
                                onClick={handleLinkClick}>퇴직금 현황</Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         "
                                to="/year/dashboard"
                                onClick={handleLinkClick}>퇴직금 검색</Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         "
                                to="/employee"
                                onClick={handleLinkClick}>사원 등록</Link>
                        </li>
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         "
                                to="/admin"
                                onClick={handleLinkClick}>관리자페이지</Link>
                        </li>
                      </>
                  )}
                  {isLoggedIn && role === "ROLE_TEAM" && (
                      <>
                        <Dropdown>
                          <Dropdown.Toggle variant="link" className="nav-link text-dark fw-bold">
                            근무표
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item as={Link} to="/workSchedule/main">근무기록</Dropdown.Item>
                            <Dropdown.Item as={Link} to="workSchedule/list">근무표 일람</Dropdown.Item>
                            <Dropdown.Item as={Link} to="workSchedule/dashBoard">MyPage</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         "
                                to="/admin/list"
                                onClick={handleLinkClick}>팀원관리(테스트)</Link>
                        </li>
                      </>
                  )}
                  {isLoggedIn && role === "ROLE_GENERAL" && (
                      <div>
                        <Dropdown>
                          <Dropdown.Toggle variant="link" className="nav-link text-dark fw-bold">
                            근무표
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item as={Link} to="/workSchedule/main">근무기록</Dropdown.Item>
                            <Dropdown.Item as={Link} to="workSchedule/list">근무표 일람</Dropdown.Item>
                            <Dropdown.Item as={Link} to="workSchedule/dashBoard">MyPage</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                  )}
                </ul>
                <div className="d-flex justify-content-end ">
                  <button className={`btn right ${isLoggedIn ? "btn-outline-light text-dark fw-bold" : "btn-primary text-white fw-bold"}` } onClick={handleLoginLogout}>
                    {isLoggedIn ? "로그아웃" : "로그인"}
                  </button>
                </div>
              </div>
          </div>
        </nav>
  );
};
export default NavigationBar;
