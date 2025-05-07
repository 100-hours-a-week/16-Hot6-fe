import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getConfig } from '@/config/index';

const { BASE_URL } = getConfig();

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuthResponse = async () => {
      try {
        // 1. 현재 URL이 /oauth-success인지 확인
        if (location.pathname === '/oauth-success') {
          console.log('OAuth 로그인 성공 리다이렉트 감지');

          // 2. refreshToken으로 accessToken 재발급 요청
          const response = await axios.get(`${BASE_URL}/auth/token/refresh`, {
            withCredentials: true, // 쿠키를 포함하여 요청
          });

          console.log('토큰 재발급 응답:', response.data);

          // 3. 응답에서 accessToken 추출 및 저장
          if (response.data.status === 200 && response.data.data.accessToken) {
            const { accessToken } = response.data.data;

            // accessToken 저장
            localStorage.setItem('accessToken', accessToken);

            // 홈으로 리다이렉트
            navigate('/');
          } else {
            console.error('토큰 재발급 실패:', response.data);
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('OAuth 처리 중 에러:', error);
        navigate('/login');
      }
    };

    handleOAuthResponse();
  }, [location, navigate]);

  // 로딩 상태 표시
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;
