import { useState, useEffect } from "react";
import createAxiosInstance from "../../config/api";
import { useAuth } from "../../config/AuthContext";
import {useNavigate} from "react-router-dom";

const useWorkDefaultData = () => {
    const { username } = useAuth();
    const navigate = useNavigate();
    const [workDefaultData, setWorkDefaultData] = useState(null);
    let cachedHolidays = null; // 캐싱하여 여러 번 호출해도 다시 요청하지 않음

    useEffect(() => {
        if (cachedHolidays) {
            setWorkDefaultData(cachedHolidays); // 이미 로드된 데이터가 있다면 설정
            return;
        }

        const fetchData = async () => {
            try {
                const axiosInstance = createAxiosInstance();
                const response = await axiosInstance.get(
                    '/workSchedule/default'
                );
                cachedHolidays = workDefaultData;
                setWorkDefaultData(response.data);
                // console.log("근무표 기본 설정 데이터", response.data); // API 응답 데이터 확인용
            } catch (err) {
            }
        };

        fetchData();
    }, [username]);

    useEffect(() => {
        if (workDefaultData?.checkInTime === "") {
            window.alert("근무표 초기 설정이 필요합니다. \n 해당 페이지로 이동합니다.");
            navigate("/workSchedule/dashBoard");
        }
    }, [workDefaultData]); // ✅ workDefaultData 변경될 때 실행

    return workDefaultData;
};

export default useWorkDefaultData;
