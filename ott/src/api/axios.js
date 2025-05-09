import axios from 'axios';
import { getConfig } from '@/config/index';

const { BASE_URL } = getConfig();

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    console.log('token', token);
    if (token) {
      console.log('token 있음');
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log('error 인터셉트', error);
    return Promise.reject(error);
  },
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log('error.response', error.response);
    // 토큰이 만료되었고, 재시도하지 않았던 요청인 경우
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('토큰 만료 인터셉트');

      try {
        // 토큰 재발급
        console.log('토큰 재발급 시도');
        const response = await axios.post(
          `${BASE_URL}/auth/token/refresh`,
          {},
          {
            withCredentials: true,
          },
        );
        console.log('토큰 재발급 응답', response);
        if (response.data.status === 200 && response.data.data.accessToken) {
          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } else {
          // 리프레시 토큰도 만료된 경우
          localStorage.removeItem('accessToken');
          // 로그인 페이지로 리다이렉트
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (error) {
        // 리프레시 토큰도 만료된 경우
        localStorage.removeItem('accessToken');
        // 로그인 페이지로 리다이렉트
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
