import React from 'react';
import {
    HashRouter as Router,
    Route,
    Routes,
    Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./config/AuthContext";
import LoginPage from "./mainpages/LoginPage";
import Dashboard from "./calcul/pages/Dashboard";
import NavigationBar from "./config/Navbar";
import AccrualDetail from "./calcul/pages/AccrualDetail";
import Admin from "./Admin/pages/Admin";
import EmployeeDashboard from "./calcul/pages/EmployeeDashboard";
import EmployeeRegi from "./calcul/pages/EmployeeRegi";
import EmployeeDetail from "./calcul/pages/EmployeeDetail";
import {useEffect} from "react";
import { useNavigate, useLocation  } from "react-router-dom";
import PersonnelDashboard from "./personnel/pages/PersonnelDashboard";
import YearDashboard from "./calcul/pages/YearDashboard";
import PersonnelDetail from "./personnel/pages/PersonnelDetail";
import PersonnelRegi from "./personnel/pages/PersonnelRegi";
import PersonnelFile from "./personnel/pages/PersonnelFile";
import PersonnelInsititutionList from "./personnel/pages/PersonnelInsititutionList";
import PersonnelInstitutionDetail from "./personnel/pages/PersonnelInstitutionDetail";
import PersonneScheduleEdit from "./personnel/pages/PersonneScheduleEdit";
import PersonneScheduleRegi from "./personnel/pages/PersonnelScheduleRegi";
import PersonnelInstitutionSchedule from "./personnel/pages/PersonnelInstitutionSchedule";
import PersonnelInsititutionRegi from "./personnel/pages/PersonnelInsititutionRegi";
import WorkScheduleList from "./jobScedule/pages/WorkScheduleList";
import WorkScheduleDashboard from "./jobScedule/pages/WorkScheduleDashboard";
import WorkScheduleDetail from "./jobScedule/pages/WorkScheduleDetail";
import WorkScheduleMain from "./jobScedule/pages/WorkScheduleMain";
import WorkScheduleReceipt from "./jobScedule/pages/WorkScheduleReceipt";
import AdminWorkScheduleDashboard from "./Admin/pages/AdminWorkScheduleDashboard";
import AdminWorkScheduleList from "./Admin/pages/AdminWorkScheduleList";
import AdminWorkScheduleDetail from "./Admin/pages/AdminWorkScheduleDetail";
import AdminWorkScheduleReceipt from "./Admin/pages/AdminWorkScheduleReceipt";
import Footer from "./config/Footer";
import ScrollToTopButton from "./config/ScrollToTopButton";
import MainPage from "./mainpages/MainPage";
import SessionWarningModal from "./config/SessionWarningModal";
import { LoadingProvider, useLoading } from "./utils/LoadingContext";
import { StatusBar, Style } from '@capacitor/status-bar';

const Layout = ({ children }) => {
    const { isProcessing } = useLoading();
    const {
        showWarningModal,
        extendSession,
        logout,
        setShowWarningModal,
    } = useAuth();

    return (
        <>
            <div className="flex flex-col min-h-screen"  style={{
                    marginTop: "20px"}}>
                <NavigationBar />
                {/* ✅ 세션 만료 경고 모달 */}
                <SessionWarningModal
                    show={showWarningModal}
                    onExtend={() => {
                        extendSession();
                        setShowWarningModal(false);
                    }}
                    onLogout={() => {
                        logout();
                        setShowWarningModal(false);
                    }}
                />
                {isProcessing && (
                    <div
                        className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
                    >
                        <div className="spinner-border text-light" role="status">
                            <span className="visually-hidden">처리 중...</span>
                        </div>
                    </div>
                )}
                <main className="flex-grow">
                    <div
                        style={{
                            marginTop: "20px",
                            padding: "0px",
                            minHeight: "calc(100vh - 100px)",
                            marginBottom: "50px",
                        }}
                    >
                        {children}
                    </div>
                    <ScrollToTopButton />
                </main>

                <Footer />
            </div>
        </>
    );
};


//로그인 상태 권한 설정 권한 Nav
const ProtectedRoute = ({ children }) => {
    const { isLoggedIn , role} = useAuth();
    if(role === "ROLE_ADMIN"){
        return isLoggedIn ?
            children
            : <Navigate to="/" />;
    } else if (role === "ROLE_GENERAL"){
        return isLoggedIn ?
            children
            : <Navigate to="/" />;
    } else if (role === "ROLE_TEAM"){
        return isLoggedIn ?
            children
            : <Navigate to="/" />;
    }else if (role === "ROLE_TEAM_LEADER"){
        return isLoggedIn ?
            children
            : <Navigate to="/" />;
    }
};

const App = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  useEffect(() => {
      const currentHash = window.location.hash;

      // 로그인 상태이고 홈 경로라면 대시보드로 이동
      if (isLoggedIn && (currentHash === '#' || currentHash === '#/')) {
          navigate('/main');
      }
      // 로그인되지 않은 상태이고, 홈 경로가 아니라면 홈으로 이동 (또는 로그인 페이지)
      else if (!isLoggedIn && currentHash !== '#' && currentHash !== '#/') {
          navigate('/');
      }
  }, [isLoggedIn, navigate]);

    useEffect(() => {
        // 웹뷰 위에 상태바가 겹치지 않게
        StatusBar.setOverlaysWebView({ overlay: false });

        // 상태바 스타일 (필요 시 어둡거나 밝게 조정)
        StatusBar.setStyle({ style: Style.Light }); // or Style.Dark
    }, []);
  
    return(
        <LoadingProvider>
        <Layout>
            <Routes>
                <Route
                    path="/"
                    element={<LoginPage />}
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/:employeeId"
                    element={
                        <ProtectedRoute>
                            <AccrualDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <Admin />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/employee"
                    element={
                        <ProtectedRoute>
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/employee/new"
                    element={
                        <ProtectedRoute>
                            <EmployeeRegi />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/employee/:employeeId"
                    element={
                        <ProtectedRoute>
                            <EmployeeDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/personnel/dashboard"
                    element={
                        <ProtectedRoute>
                            <PersonnelDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/year/dashboard"
                    element={
                        <ProtectedRoute>
                            <YearDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/personnel/applicant/:Id"
                    element={
                        <ProtectedRoute>
                            <PersonnelDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/personnel/applicant/new"
                    element={
                        <ProtectedRoute>
                            <PersonnelRegi />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/personnel/applicant/:Id/files"
                    element={
                        <ProtectedRoute>
                            <PersonnelFile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/personnel/institution/list"
                    element={
                        <ProtectedRoute>
                            <PersonnelInsititutionList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/personnel/institution/:Id"
                    element={
                        <ProtectedRoute>
                            <PersonnelInstitutionDetail/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/personnel/institution/:Id/schedule/:scheduleId"
                    element={
                        <ProtectedRoute>
                            <PersonneScheduleEdit/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/personnel/institution/:Id/schedule/new"
                    element={
                        <ProtectedRoute>
                            <PersonneScheduleRegi/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/personnel/institution/schedule/list"
                    element={
                        <ProtectedRoute>
                            <PersonnelInstitutionSchedule/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/personnel/institution/new"
                    element={
                        <ProtectedRoute>
                            <PersonnelInsititutionRegi/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/workSchedule/list"
                    element={
                        <ProtectedRoute>
                            <WorkScheduleList/>
                        </ProtectedRoute>
                    }
                />
                <Route
                path="/workSchedule/dashBoard"
                element={
                    <ProtectedRoute>
                        <WorkScheduleDashboard/>
                    </ProtectedRoute>
                }
            />
                <Route
                    path="/workSchedule/detail/:date"
                    element={
                        <ProtectedRoute>
                            <WorkScheduleDetail/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/workSchedule/main"
                    element={
                        <ProtectedRoute>
                            <WorkScheduleMain/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/workSchedule/receipt/:month"
                    element={
                        <ProtectedRoute>
                            <WorkScheduleReceipt/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/list"
                    element={
                        <ProtectedRoute>
                            <AdminWorkScheduleDashboard/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/workSchedule/adminList/:id"
                    element={
                        <ProtectedRoute>
                            <AdminWorkScheduleList/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/workSchedule/adminDetail/:date/:id"
                    element={
                        <ProtectedRoute>
                            <AdminWorkScheduleDetail/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/workSchedule/receipt/:date/:id"
                    element={
                        <ProtectedRoute>
                            <AdminWorkScheduleReceipt/>
                        </ProtectedRoute>
                    }
                />
                <Route path="*"
                       element={
                    <Navigate to="/main" replace />
                }
                />
                <Route
                    path="/main"
                    element={
                        <ProtectedRoute>
                            <MainPage/>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Layout>
        </LoadingProvider>
    );
};

const Root = () => (
  <AuthProvider>
    <Router>
      <App />
    </Router>
  </AuthProvider>
);

export default Root;