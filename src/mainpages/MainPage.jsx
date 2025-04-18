import { Link } from 'react-router-dom';
import {useAuth} from "../config/AuthContext";
import './MainPage.css';

const MainPage = () => {
    const { role } = useAuth();
    const date = new Date().toLocaleDateString("ja-JP", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
    // console.log(date); // 예: 2025年4月15日(火)
    const links = [
        {
            title: '근무표 일람',
            description: '본인의 근무표를 조회하거나 수정합니다.',
            path: '/workSchedule/list',
            rel: null
        },
        {
            title: '근무기록',
            description: date + '\n금일 근무시간을 기록합니다.',
            path: '/workSchedule/main',
            rel : null
        },
        role === 'ROLE_ADMIN' && {
            title: '사원정보',
            description: '사원들의 개인 정보를 관리합니다.',
            path: "/employee",
            rel: null
        },
        (role === 'ROLE_ADMIN' || role === 'ROLE_TEAM_LEADER' || role === 'ROLE_TEAM') && {
            title: '근무표 관리',
            description: '사원들의 근무표를 관리합니다.',
            path: "/admin/list",
            rel: null
        },
        {
            title: '社内WIKI',
            description: '사내 스케쥴 및 정보를 확인합니다.',
            path: 'https://sites.google.com/view/weavuswiki/%E7%A4%BE%E5%86%85%E6%97%A5%E7%A8%8B',
            rel : "noopener noreferrer",
            target : "_blank"
        },
    ].filter(Boolean);

    return (
        <div className="container py-5">
            <h1 className="text-center mb-4">WEAVUS 포털</h1>
            <div className="row">
                {links.map((link) => (
                    <div key={link.title} className="col-md-6 mb-4">
                        <Link
                            to={link.path}
                            rel={link.rel}
                            target={link.target}
                            className="text-decoration-none text-dark"
                        >
                            <div className="card shadow-sm h-100 hover-card">
                                <div className="card-body">
                                    <h5 className="card-title">{link.title}</h5>
                                    <p className="card-text">{link.description}</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MainPage;
