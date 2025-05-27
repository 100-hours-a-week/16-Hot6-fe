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
      // 리프레시 토큰 갱신 시도 등 추가 가능
      // ...여기선 생략, 바로 로그인 필요 모달
      triggerGlobalModal({
        open: true,
        message: '로그인이 필요합니다. 로그인 후 다시 시도해주세요.',
        leftButtonText: '나중에',
        rightButtonText: '로그인하기',
        onLeftClick: () => triggerGlobalModal({ open: false }),
        onRightClick: () => {
          triggerGlobalModal({ open: false });
          window.location.href = '/login'; // useNavigate 쓸 수 없는 위치이므로
        },
      });
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
