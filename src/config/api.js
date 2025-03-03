// api.js (Axios 공통 설정)
import axios from "axios";

const createAxiosInstance = () => {
  const token = localStorage.getItem("token");

  return axios.create({
    baseURL: "https://port-0-severance-m4yzyreu8bbe535f.sel4.cloudtype.app/api", // 서버 URL
    // baseURL: "http://localhost:8080/api", //테스트 로컬 도메인
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json", // 기본 헤더 설정
    },
    timeout: 300000, // 기본 타임아웃 설정 (5분)
  });
};

export default createAxiosInstance;
