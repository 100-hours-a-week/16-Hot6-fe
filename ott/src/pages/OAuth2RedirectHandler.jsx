// src/pages/OAuth2RedirectHandler.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// import useAuthStore from '@/store/useAuthStore';
import axios from '@/api/axios';

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const { search, pathname } = useLocation();

  useEffect(() => {
    (async () => {
      try {
        // 현재 URL: /login/oauth2/code/kakao?code=...&state=...
        // 그대로 GET 요청하면 백엔드가 JSON을 응답해 줌
        const { data: resp } = await axios.get(`${pathname}${search}`, {
          headers: { Accept: 'application/json' },
        });

        // { status:200, message:"...", data:{ accessToken, user }}
        const { accessToken, user } = resp.data;
        console.log(accessToken, user);
        // Zustand에 저장
        // setAuth({ accessToken, user });

        // 메인 화면으로
        navigate('/', { replace: true });
      } catch (err) {
        console.error('OAuth 콜백 처리 중 에러', err);
        // 로그인 페이지로 복귀
        navigate('/login', { replace: true });
      }
    })();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">로그인 처리 중… 잠시만 기다려 주세요.</p>
    </div>
  );
}
