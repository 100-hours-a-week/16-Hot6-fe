import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getConfig } from '@/config/index';
import useAuthStore from '@/store/authStore';

const { BASE_URL } = getConfig();

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuthResponse = async () => {
      console.log('OAuth2RedirectHandler 호출됨');
      if (location.pathname === '/oauth-success') {
        console.log('OAuth 로그인 성공 리다이렉트 감지');
        // authStore의 login 함수 호출
        await useAuthStore.getState().login(navigate);
      }
    };
    handleOAuthResponse();
  }, [location.pathname]);

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
