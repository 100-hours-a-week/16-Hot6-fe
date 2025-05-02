import React from 'react';
import logo from '../assets/images/logo/logo.svg';
import kakaoLoginButton from '@/assets/images/buttons/kakao-login-button.svg'; // 카카오 버튼 이미지 import
import { API } from '@/api/client.js';

const Login = () => {
  const handleKakaoLogin = async () => {
    try {
      const response = await fetch(`${API.auth.kakao}/auth/kakao`, {
        method: 'GET',
        headers: {
          Accept: 'application/json', // 서버로부터 JSON 응답을 받기 위한 헤더
        },
      });

      const data = await response.json();
      window.location.href = data.redirectUrl;
    } catch (error) {
      console.error('카카오 로그인 초기화 실패:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      {/* 로고 섹션 */}
      <div className="mb-20 text-center">
        <div className="flex items-center justify-center gap-1 mb-16">
          <img src={logo} alt="OnTheTop" className="h-6" />
          <span className="text-xl font-semibold">OnTheTop</span>
        </div>

        <h1 className="text-2xl font-bold mb-2">예산은 가볍게, 감성은 무겁게</h1>
        <p className="text-gray-600">나에게 꼭 맞는 데스크 추천</p>
      </div>

      {/* 카카오 로그인 버튼 */}
      <button className="w-full max-w-sm" onClick={handleKakaoLogin}>
        <img src={kakaoLoginButton} alt="카카오 로그인" className="w-full" />
      </button>
    </div>
  );
};

export default Login;
