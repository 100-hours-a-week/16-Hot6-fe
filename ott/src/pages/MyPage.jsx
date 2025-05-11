import React, { useState } from 'react';

// 더미 데이터
const dummyUser = {
  nicknameCommunity: 'junsik',
  nicknameKakao: 'teddy.hwang', // 없으면 null
  profileImagePath: 'https://k.kakaocdn.net/...jpg',
  point: 1200,
  isCertified: true, // false면 추천인 코드 입력
};

export default function MyPage() {
  const [user] = useState(dummyUser);

  // 포인트 3자리마다 콤마
  const formatPoint = (point) => point.toLocaleString() + 'P';

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white pb-24">
      {/* 프로필 영역 */}
      <div className="flex flex-col items-center py-6">
        <img
          src={user.profileImagePath}
          alt="profile"
          className="w-[85px] h-[85px] rounded-full object-cover border"
        />
        <div className="mt-3 text-lg font-bold">{user.nicknameCommunity} 님,</div>
        <div className="text-gray-500 text-base">데스크를 꾸며보세요!</div>
      </div>

      {/* 바로가기 버튼들 */}
      <div className="flex justify-center gap-8 py-4">
        <button className="flex flex-col items-center">
          <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="text-xs mt-1">알림</span>
        </button>
        <button className="flex flex-col items-center">
          <svg width="28" height="28" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span className="text-xs mt-1">스크랩</span>
        </button>
        <button className="flex flex-col items-center">
          <svg width="28" height="28" fill="#222" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
          <span className="text-xs mt-1">데스크</span>
        </button>
      </div>

      {/* 포인트/추천인 코드 */}
      <div className="mx-4 my-4 p-4 border rounded flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">{formatPoint(user.point)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {user.isCertified ? '인증됨' : '추천인 코드 입력'}
          </div>
        </div>
        <button className="px-4 py-2 bg-gray-700 text-white rounded text-sm font-semibold">
          포인트 내역
        </button>
      </div>

      {/* 메뉴 리스트 */}
      <div className="mt-4">
        <button className="w-full text-left px-4 py-4 border-b text-base">나의 게시글 보기</button>
        <button className="w-full text-left px-4 py-4 border-b text-base">구매내역 보기</button>
        <button className="w-full text-left px-4 py-4 border-b text-base">회원정보 수정</button>
        <button className="w-full text-left px-4 py-4 border-b text-base">자주 묻는 질문</button>
        <button className="w-full text-left px-4 py-4 border-b text-base">문의하기</button>
        <button className="w-full text-left px-4 py-4 border-b text-base text-red-500">
          회원탈퇴
        </button>
      </div>

      {/* 하단 네비게이션 바는 별도 컴포넌트로 분리 추천 */}
    </div>
  );
}
