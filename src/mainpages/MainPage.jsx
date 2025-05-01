import { Link } from 'react-router-dom';
import {useAuth} from "../config/AuthContext";
import './MainPage.css';
import {Capacitor} from "@capacitor/core";
import usePushNotificationPermission from "../hooks/usePushNotificationPermission";

const MainPage = () => {
    const { role } = useAuth();
    const date = new Date().toLocaleDateString("ja-JP", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
    // console.log(date); // 예: 2025年4月15日(火)
    const links = [
        {
            title: '勤務表スケジュール',
            description: '本人の勤務表を確認または修正、提出します。',
            path: '/workSchedule/list',
            rel: null
        },
        {
            title: '勤務記録',
            description: date + '\n当日の勤務時間を記録します。',
            path: '/workSchedule/main',
            rel : null
        },
        {
            title: '勤務表 基本情報',
            description: '本人の勤務表の基本情報を設定します。',
            path: '/workSchedule/dashBoard',
            rel : null
        },
        role === 'ROLE_ADMIN' && {
            title: '社員情報',
            description: '社員の個人情報を管理します。',
            path: "/employee",
            rel: null
        },
        (role === 'ROLE_ADMIN' || role === 'ROLE_TEAM_LEADER' || role === 'ROLE_TEAM') && {
            title: '勤務表管理',
            description: '社員たちの勤務表を管理します。',
            path: "/admin/list",
            rel: null
        },
        {
            title: '社内WIKI',
            description: '社内スケジュールおよび情報を確認するサイトに移動します。',
            path: 'https://sites.google.com/view/weavuswiki/%E7%A4%BE%E5%86%85%E6%97%A5%E7%A8%8B',
            rel : "noopener noreferrer",
            target : "_blank"
        },
    ].filter(Boolean);

    if (Capacitor.isNativePlatform()) {
        usePushNotificationPermission(); // 푸시 알림 토큰 가져오기
    }

    return (
        <div className="container py-5">
            <h1 className="text-center mb-4">WEAVUS ポータル</h1>
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
