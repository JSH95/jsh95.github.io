import { useState, useCallback} from "react";
import createAxiosInstance from "../../config/api";

export function InstitutionListApi() {
    const [institutionList, setInstitutionList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const loadList = useCallback(async () => {
        setLoading(true);
        setError("");   // 상태 초기화
                try {
                    const axiosInstance = createAxiosInstance(); // 인스턴스 생성
                    const response = await axiosInstance.get("/personnel/institution/list");
                    setInstitutionList(response.data);
                } catch (err) {
                    setError("교육기관 정보를 불러오지 못했습니다.");
                    console.error(err);
                } finally {
                    setLoading(false);
                }
    }, []);
    return { loadList, loading, error, institutionList};
}
