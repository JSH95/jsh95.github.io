import { useState, useCallback} from "react";
import createAxiosInstance from "../config/api";

export function AdministratorListApi() {
    const [administratorList, setAdministratorList] = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminErrorMsg, setAdminErrorMsg] = useState("");

    const adminLoadList = useCallback(async () => {
        setAdminLoading(true);
        setAdminErrorMsg("");   // 상태 초기화
                try {
                    const axiosInstance = createAxiosInstance(); // 인스턴스 생성
                    const response = await axiosInstance.get("/admin/permissions");
                    setAdministratorList(response.data);
                } catch (err) {
                    setAdminErrorMsg("Failed to retrieve administrator list. \n Pleaze try again.");
                } finally {
                    setAdminLoading(false);
                }
    }, []);

    return { adminLoadList, adminLoading, adminErrorMsg, administratorList};
}
