import { getConfig } from '@/config/index';
import { triggerGlobalModal } from '@/hooks/globalModalController';
import axios from 'axios';

const { BASE_URL } = getConfig();

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 0,
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 토큰 재발급
        const response = await axios.post(
          `${BASE_URL}/auth/token/refresh`,
          {},
          { withCredentials: true },
        );
        if (response.data.status === 200 && response.data.data.accessToken) {
          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } else {
          // 리프레시 토큰도 만료된 경우
          return handleRefreshTokenExpired(error);
        }
      } catch (error) {
        // 리프레시 토큰도 만료된 경우
        return handleRefreshTokenExpired(error);
      }
    }
    return Promise.reject(error);
  },
);

function handleRefreshTokenExpired(error) {
  localStorage.removeItem('accessToken');
  triggerGlobalModal({
    open: true,
    message: '로그인이 필요합니다. 로그인 후 다시 시도해주세요.',
    leftButtonText: '나중에',
    rightButtonText: '로그인하기',
    onLeftClick: () => triggerGlobalModal({ open: false }),
    onRightClick: () => {
      triggerGlobalModal({ open: false });
      window.location.href = '/login';
    },
  });
  return Promise.reject(error);
}

export default axiosInstance;
