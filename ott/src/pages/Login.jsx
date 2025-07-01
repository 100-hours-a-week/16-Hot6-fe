import { API } from '@/api/client.js';
import kakaoLoginButton from '@/assets/images/buttons/kakao-login-button.svg'; // 카카오 버튼 이미지 import
import TopBar from '@/components/common/TopBar.jsx';
import React from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../assets/images/logo/logo.svg';

const Login = () => {
  const location = useLocation();

  const handleKakaoLogin = () => {
    // URL에서 redirect 파라미터 추출
    const urlParams = new URLSearchParams(location.search);
    let redirectUrl = urlParams.get('redirect');

    // URL에 없으면 localStorage에서 가져오기 (토큰 만료로 인한 재로그인)
    if (!redirectUrl) {
      redirectUrl = localStorage.getItem('loginRedirectUrl');
    }

    // localStorage에 redirect URL 저장
    if (redirectUrl) {
      localStorage.setItem('loginRedirectUrl', redirectUrl);
    }

    window.location.href = `${API.auth.kakao}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[640px] mx-auto min-h-screen bg-white">
        <TopBar title="로그인" />

        {/* 컨텐츠 영역: TopBar 아래에서 중앙 정렬 */}
        <div className="flex flex-col items-center justify-center px-4 mt-32">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-16">
              <img src={logo} alt="OnTheTop" className="h-6" />
              <span className="text-xl font-medium">OnTheTop</span>
            </div>

            <h1 className="text-2xl font-bold mb-2">예산은 가볍게, 감성은 무겁게</h1>
            <p className="text-gray-600">나에게 꼭 맞는 데스크 추천</p>
          </div>

          <button className="w-full max-w-sm" onClick={handleKakaoLogin}>
            <img src={kakaoLoginButton} alt="카카오로 시작하기" className="w-full" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
