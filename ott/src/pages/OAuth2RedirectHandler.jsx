import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  useEffect(() => {
    const handleOAuthResponse = async () => {
      try {
        console.log('location.pathname', location.pathname);
        // 백엔드에 인증 코드 전송
        if (await login(location.pathname)) {
          // 홈으로 리다이렉트
          navigate('/');
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('카카오 로그인 처리 중 에러:', error);
        // 에러 발생 시 로그인 페이지로 리다이렉트
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
