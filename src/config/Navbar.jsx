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
  const { isLoggedIn, logout, role, username} = useAuth(); // useAuth 훅을 사용하여 로그인 상태와 logout 함수 가져오기
  const [showModal, setShowModal] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);

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
          await axiosInstance.post('/employees/password', null,{
            headers: {
              "id": id,
              "password": password,
            }
          })
          alert('비밀번호가 변경되었습니다.');
          window.location.reload(); // 부모 창 새로고침
        }catch (err) {
          // console.error('비밀번호 변경 중 오류 발생:', err);
          alert('비밀번호 변경 중 오류가 발생했습니다.');
        }
      }
    };
    window.addEventListener('message', handlePasswordChange);
    return () => {
      window.removeEventListener('message', handlePasswordChange);
    };
  }, []);

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
                            <Dropdown.Item as={Link} to="/workSchedule/main"  onClick={handleLinkClick}>근무기록</Dropdown.Item>
                            <Dropdown.Item as={Link} to="workSchedule/list" onClick={handleLinkClick}>근무표 일람</Dropdown.Item>
                            <Dropdown.Item as={Link} to="workSchedule/dashBoard" onClick={handleLinkClick}>근무표 기본 정보</Dropdown.Item>
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
                  {isLoggedIn && (role === "ROLE_TEAM" || role === "ROLE_TEAM_LEADER") && (
                      <>
                        {/*<Dropdown>*/}
                        {/*  <Dropdown.Toggle variant="link" className="nav-link text-dark fw-bold">*/}
                        {/*    근무표*/}
                        {/*  </Dropdown.Toggle>*/}
                        {/*  <Dropdown.Menu>*/}
                        {/*    <Dropdown.Item as={Link} to="/workSchedule/main">근무기록</Dropdown.Item>*/}
                        {/*    <Dropdown.Item as={Link} to="workSchedule/list">근무표 일람</Dropdown.Item>*/}
                        {/*    <Dropdown.Item as={Link} to="workSchedule/dashBoard">근무표 기본 정보</Dropdown.Item>*/}
                        {/*  </Dropdown.Menu>*/}
                        {/*</Dropdown>*/}
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         "
                                to="/workSchedule/main"
                                onClick={handleLinkClick}>근무기록</Link>
                        </li>
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         "
                                to="workSchedule/list"
                                onClick={handleLinkClick}>근무표 일람</Link>
                        </li>
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         "
                                to="workSchedule/dashBoard"
                                onClick={handleLinkClick}>근무표 기본 정보</Link>
                        </li>
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         "
                                to="/admin/list"
                                onClick={handleLinkClick}>근무표 관리</Link>
                        </li>
                      </>
                  )}
                  {isLoggedIn && role === "ROLE_GENERAL" && (
                      <>
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         "
                                onClick={handleLinkClick}>근무기록</Link>
                        </li>
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         "
                                to="workSchedule/list"
                                onClick={handleLinkClick}>근무표 일람</Link>
                        </li>
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         "
                                to="workSchedule/dashBoard"
                                onClick={handleLinkClick}>근무표 기본 정보</Link>
                        </li>
                        <li className="nav-item" >
                          <Link className="nav-link
                                         text-dark
                                         fw-bold
                                         "
                                to="/admin/list"
                                onClick={handleLinkClick}>근무표 관리</Link>
                        </li>
                      </>
                  )}
                </ul>
                <div className="d-flex justify-content-end mt-2">
                  {isLoggedIn ?
                      <>
                        <button
                            onClick={() => handlePassword(username)}
                            className="btn btn-outline-light text-dark fw-bold"
                            type="button"
                        >비밀번호 변경</button>
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
                    {isLoggedIn ? "로그아웃" : "로그인"}
                  </button>
                </div>
              </div>
          </div>
        </nav>
  );
};
export default NavigationBar;
