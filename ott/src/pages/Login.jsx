import React from 'react';
import logo from '../assets/images/logo/logo.svg';
import kakaoLoginButton from '@/assets/images/buttons/kakao-login-button.svg'; // 카카오 버튼 이미지 import
import { API } from '@/api/client.js';
import TopBar from '@/components/common/TopBar.jsx';
const Login = () => {
  const handleKakaoLogin = () => {
    window.location.href = `${API.auth.kakao}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[640px] mx-auto min-h-screen bg-white">
        <TopBar title="로그인" />

        {/* 컨텐츠 영역: TopBar 아래에서 중앙 정렬 */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] px-4">
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
