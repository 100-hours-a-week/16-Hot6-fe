import React from 'react';
import logo from '../assets/images/logo/logo.svg';
import kakaoLoginButton from '@/assets/images/buttons/kakao-login-button.svg'; // 카카오 버튼 이미지 import
import axios from 'axios';
import TopBar from '@/components/common/TopBar.jsx';
import { API } from '@/api/client.js';
const Login = () => {
  const handleKakaoLogin = async () => {
    try {
      // 1. 백엔드에 카카오 로그인 요청
      const response = await axios.get(`${API.auth.kakao}`, {
        // 302 리다이렉트를 자동으로 따라가지 않도록 설정
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // 302도 유효한 상태로 처리
        },
      });
      // 2. Location 헤더에서 카카오 로그인 URL 가져오기
      const kakaoAuthUrl = response.headers.location;

      // 3. 카카오 로그인 페이지로 리다이렉트
      if (kakaoAuthUrl) {
        window.location.href = kakaoAuthUrl;
      }
    } catch (error) {
      console.error('카카오 로그인 요청 실패:', error);
      // 에러 처리 (예: 에러 메시지 표시)
    }
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
