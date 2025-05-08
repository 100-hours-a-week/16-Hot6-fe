import { create } from 'zustand';
import { API } from '@/api/client.js';
import axios from '@/api/axios.js';

const BASE_URL = '...'; // 실제 BASE_URL로 교체

const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem('accessToken'),
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),

  // 로그인
  login: async (navigate) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/token/refresh`,
        {},
        {
          withCredentials: true,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('토큰 재발급 응답:', response.data);

      if (response.data.status === 200 && response.data.data.accessToken) {
        const { accessToken } = response.data.data;
        // localStorage 저장
        localStorage.setItem('accessToken', accessToken);
        // 전역 상태 저장
        set({ accessToken, isAuthenticated: true });
        // 홈으로 이동
        if (navigate) navigate('/');
      } else {
        console.error('토큰 재발급 실패:', response.data);
        if (navigate) navigate('/login');
      }
    } catch (error) {
      console.error('OAuth 처리 중 에러:', error);
      if (navigate) navigate('/login');
    }
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('accessToken');

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
  },

  // 사용자 정보 업데이트
  updateUser: (userData) => {
    set({ user: userData });
  },
}));

export default useAuthStore;
