import { create } from 'zustand';
import { API } from '@/api/client.js';
import axios from '@/api/axios.js';

const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem('accessToken'),
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),

  // 로그인
  login: async (requestUrl) => {
    try {
      const response = await axios.get(requestUrl);
      const { accessToken } = response.data;

      localStorage.setItem('accessToken', accessToken);

      set({
        accessToken,
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
