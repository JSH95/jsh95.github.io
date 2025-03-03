import React from "react";
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

const Layout = ({ children }) => (
    <>
        <NavigationBar />
        <div style={{ marginTop: "100px", padding: "0px" }}>{children}</div>
    </>
);

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? children : <Navigate to="/" />;
};

const App = () => {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const location = useLocation();

    useEffect(() => {
        // 새로고침 후 로그인 상태 확인
        if (isLoggedIn && location.pathname === "/#/") {
            navigate('/dashboard'); // 로그인 상태에서 "/"에 있을 경우에만 리다이렉트
        } else if (!isLoggedIn && location.pathname !== "/#/") {
            navigate('/'); // 로그인되지 않은 사용자가 다른 경로로 접근할 경우 리다이렉트
        }
    }, [isLoggedIn, navigate, location.pathname ]);

    return(
        <Layout>
            <Routes>
                <Route path="/" element={<LoginPage />} />
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
            </Routes>
        </Layout>
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
