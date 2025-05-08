import { useState, useEffect, useCallback, useRef } from "react";
import createAxiosInstance from "../../config/api";
import { useAuth } from "../../config/AuthContext";
import { useLoading } from "../../utils/LoadingContext";

const useWorkData = (year, month, id) => {
    const { username } = useAuth();
    const { setIsProcessing } = useLoading();

    const [workData, setWorkData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const cacheRef = useRef(null);

    // 1) fetch 함수에 year/month/id 등을 deps에 넣어 안정화
    const fetchWorkData = useCallback(async () => {
        setLoading(true);
        setError("");
        // setIsProcessing(true);

        const ID = id || username;

        try {
            // 캐시가 비어 있을 때만 요청
            if (!cacheRef.current) {
                const response = await createAxiosInstance().get(
                    `/workSchedule/${ID}/${year}/${month}`
                );

                const newWorkDataList = {};
                // console.log("response", response.data); // API 응답 데이터 확인용
                response.data.forEach((event) => {
                    const date = new Date(event.checkInDate);
                    const key = `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

                    const formatTime = (time) =>
                        time ? time.split(":").slice(0, 2).join(":") : "";

                    newWorkDataList[key] = {
                        id: event.id || "",
                        checkInDate: event.checkInDate || "",
                        checkInTime: formatTime(event.checkInTime),
                        checkOutDate: event.checkOutDate || "",
                        checkOutTime: formatTime(event.checkOutTime),
                        memo: event.memo || "",
                        breakTime: event.breakTime || "",
                        workType: event.workType || "",
                        workLocation: event.workLocation || "",
                        workPosition: event.workPosition || "",
                        workFileStatus:
                            event.workScheduleFileList.length > 0
                                ? event.workScheduleFileList.length
                                : "0",
                        fileName: event.workScheduleFileList[0]?.fileName || "",
                        fileUrl: event.workScheduleFileList[0]?.url || "",
                        fileId: event.workScheduleFileList[0]?.id || "",
                        workStatus: event.workScheduleState || "",
                        checkMemo: event.checkStateMemo || "",
                        employeeId: event.employee.id || "",
                        employeeName: event.employee.name || "",
                        flexTime: event.flexTime || false,
                    };
                });

                cacheRef.current = newWorkDataList;
            }

            // 캐시에서 꺼내서 상태 설정
            setWorkData(cacheRef.current);
            // console.log("workData", cacheRef.current); // 캐시에서 꺼낸 데이터 확인용
        } catch (err) {
            setError("근무 데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
            // setIsProcessing(false);
        }
    }, [username, id, year, month, setIsProcessing]);

    // 2) year/month/id가 바뀔 때마다 캐시 초기화 + fetch
    useEffect(() => {
        cacheRef.current = null;
        fetchWorkData();
    }, [fetchWorkData]);

    return { workData, fetchWorkData, loading, error };
};

export default useWorkData;
