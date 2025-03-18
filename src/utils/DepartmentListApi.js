import { useState, useCallback} from "react";
import createAxiosInstance from "../config/api";

export function DepartmentListApi() {
    const [departmentList, setDepartmentList] = useState([]);
    const [deLoading, setLoading] = useState(false);
    const [deErrorMsg, setErrorMsg] = useState("");


    const deLoadList = useCallback(async () => {
        setLoading(true);
        setErrorMsg("");   // 상태 초기화
                try {
                    const axiosInstance = createAxiosInstance(); // 인스턴스 생성
                    const response = await axiosInstance.get("/employees/department/allList");
                    setDepartmentList(response.data);
                    // console.log("부서 목록: ", response.data);
                } catch (err) {
                    setErrorMsg("부서 목록을 불러오지 못했습니다. \n 다시 시도해주세요.");
                } finally {
                    setLoading(false);
                }
    }, []);
    return { deLoadList, deLoading, deErrorMsg, departmentList};
}
