import axiosInstance from '@/api/axios';
import axios from '@/api/axios.js';
import { getConfig } from '@/config/index';
import { create } from 'zustand';
const { BASE_URL } = getConfig();

const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem('accessToken'),
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),

  // 로그인
  login: async (navigate, redirectUrl = null) => {
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

      if (response.data.status === 200 && response.data.data.accessToken) {
        const { accessToken } = response.data.data;
        // localStorage 저장
        localStorage.setItem('accessToken', accessToken);
        // 전역 상태 저장
        set({ accessToken, isAuthenticated: true });

        // 리다이렉트 URL이 있으면 해당 URL로, 없으면 홈으로 이동
        if (navigate) {
          if (redirectUrl) {
            navigate(decodeURIComponent(redirectUrl));
          } else {
            navigate('/');
          }
        }
      } else {
        if (navigate) navigate('/login');
      }
    } catch (error) {
      if (navigate) navigate('/login');
    }
  },

  // 로그아웃
  logout: async (navigate) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
        },
      );
      if (response.data.status === 200) {
        localStorage.removeItem('accessToken');
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
        if (navigate) navigate('/');
      } else {
        console.error('로그아웃 실패:', response.data);
      }
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  },

  // 회원탈퇴
  withdraw: async (navigate) => {
    try {
      const response = await axiosInstance.delete('/users');
      if (response.data.status === 200) {
        localStorage.removeItem('accessToken');
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
        if (navigate) navigate('/');
      } else {
        console.error('회원탈퇴 실패:', response.data);
      }
    } catch (error) {
      console.error('회원탈퇴 실패:', error);
    }
  },

  // 사용자 정보 업데이트
  updateUser: (userData) => {
    set({ user: userData });
  },
}));

export default useAuthStore;
