import { useState, useEffect } from "react";
import createAxiosInstance from "../../config/api";
import { useAuth } from "../../config/AuthContext";

const useWorkData = (year, month, id) => {
    const { username } = useAuth();
    const [workData, setWorkData] = useState({});
    const [loading, setLoading] = useState(false); // 로딩 상태 추가
    const [error, setError] = useState(""); // 오류 상태 추가
    let cachedHolidays = null; // 캐싱하여 여러 번 호출해도 다시 요청하지 않음

    const fetchWorkData = async () => {
        if (cachedHolidays) {
            setWorkData(cachedHolidays); // 이미 로드된 데이터가 있다면 설정
            return;
        }
        setLoading(true);
        setError(""); // 기존 오류 초기화
        let ID;
        if(!id){
            ID = username;
        } else {
            ID = id;
        }
        try {
            const axiosInstance = createAxiosInstance();
            const response = await axiosInstance.get(
                    `/workSchedule/${ID}/${year}/${month}`
                );
                // console.log("근무 데이터 요청 결과1:", response.data)
                const newWorkDataList = {};
                if(response.data.length === 0){
                    setWorkData(newWorkDataList);
                } else {
                    response.data.forEach((event) => {
                        const date = new Date(event.checkInDate);
                        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        const formatTime = (time) => (time ? time.split(":").slice(0, 2).join(":") : "");
                        newWorkDataList[key] = {
                            id: event.id || "",
                            checkInDate: event.checkInDate || "",
                            checkInTime: formatTime(event.checkInTime),  // HH:mm:ss → HH:mm
                            checkOutDate: event.checkOutDate || "",
                            checkOutTime: formatTime(event.checkOutTime), // HH:mm:ss → HH:mm
                            memo: event.memo || "",
                            breakTimeIn: formatTime(event.breakTimeIn), // HH:mm:ss → HH:mm
                            breakTimeOut: formatTime(event.breakTimeOut), // HH:mm:ss → HH:mm
                            workType: event.workType || "",
                            workLocation: event.workLocation || "",
                            workPosition: event.workPosition || "",
                            workFileStatus:
                                event.workScheduleFileList.length > 0 ? event.workScheduleFileList.length : "0",
                            fileName : event.workScheduleFileList[0]?.fileName || "",
                            fileUrl : event.workScheduleFileList[0]?.url || "",
                            fileId : event.workScheduleFileList[0]?.id || "",
                            workStatus: event.workScheduleState || "",
                            checkMemo: event.checkStateMemo || "",
                        };
                    });
                    cachedHolidays = newWorkDataList; // 캐싱하여 중복 요청 방지
                    setWorkData(newWorkDataList);
                    console.log("근무 데이터 요청 결과2:", newWorkDataList)
                }
            } catch (err) {
                setError("근무 데이터를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            fetchWorkData();
        }, [year, month]);

    return { workData, fetchWorkData, loading, error }; // 로딩과 오류 상태 반환
};

export default useWorkData;
