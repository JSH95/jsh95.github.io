import { useState, useCallback} from "react";
import createAxiosInstance from "../config/api";

export function TeamListApi() {
    const [teamList, setTeamListApi] = useState([]);
    const [teLoding, setLoading] = useState(false);
    const [teErrorMsg, setErrorMsg] = useState("");


    const loadList = useCallback(async () => {
        setLoading(true);
        setErrorMsg("");   // 상태 초기화
                try {
                    const axiosInstance = createAxiosInstance(); // 인스턴스 생성
                    const response = await axiosInstance.get("/employees/team/allList");
                    setTeamListApi(response.data);
                } catch (err) {
                    setErrorMsg("팀장 목록을 불러오지 못했습니다. \n 다시 시도해주세요.");
                } finally {
                    setLoading(false);
                }
    }, []);
    return { loadList, teLoding, teErrorMsg, teamList};
}
