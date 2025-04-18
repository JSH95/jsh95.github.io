// api.js (Axios 공통 설정)
import axios from 'axios';
import { publishLoading } from '../utils/loadingService';

const createAxiosInstance = () => {

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  const URL = (username === "test")
      ? "http://localhost:8080/api" // 테스트 로컬 도메인
      :
      "https://port-0-severance-m4yzyreu8bbe535f.sel4.cloudtype.app/api";
  const instance =  axios.create({
      baseURL: URL, //테스트 로컬 도메인
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json', // 기본 헤더 설정
    },
    timeout: 300000, // 기본 타임아웃 설정 (5분)
  });

  instance.interceptors.request.use(config => {
    publishLoading(true);
    return config;
  }, error => {
    publishLoading(false);
    return Promise.reject(error);
  });

  instance.interceptors.response.use(response => {
    publishLoading(false);
    return response;
  }, error => {
    publishLoading(false);
    return Promise.reject(error);
  });

  return instance;
};

export default createAxiosInstance;
