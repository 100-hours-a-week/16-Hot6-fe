import { getConfig } from '@/config/index';
import useAuthStore from '@/store/authStore';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const { BASE_URL } = getConfig();

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuthResponse = async () => {
      if (location.pathname === '/oauth-success') {
        // localStorage에서 redirect URL 가져오기
        const redirectUrl = localStorage.getItem('loginRedirectUrl');

        if (redirectUrl) {
          localStorage.removeItem('loginRedirectUrl'); // 사용 후 삭제
        }

        // authStore의 login 함수 호출 (리다이렉트 URL 전달)
        await useAuthStore.getState().login(navigate, redirectUrl);
      }
    };
    handleOAuthResponse();
  }, [location.pathname, location.search]);

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
