import { create } from 'zustand';
import axios from '@/api/axios.js';

const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),

  // 로그인
  login: async (code) => {
    try {
      const response = await axios.post('/auth/kakao', { code });
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      set({
        accessToken,
        refreshToken,
        user,
        isAuthenticated: true,
      });

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

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
