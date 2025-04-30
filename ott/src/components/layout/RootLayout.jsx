import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header'; // Header 컴포넌트 import

const RootLayout = () => {
  return (
    // 전체 컨테이너에 최소/최대 너비 설정
    <div
      className="mx-auto min-h-screen flex flex-col relative bg-white"
      style={{
        maxWidth: '768px',
        width: '100%', // 100% 너비 사용
        minWidth: 'min(320px, 100%)', // 320px와 화면 너비 중 작은 값 사용
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* 배경 오버레이 (768px 이상일 때 회색 배경) */}
      <div className="fixed inset-0 bg-gray-100 -z-10 hidden md:block" />

      {/* 실제 컨텐츠 영역 (흰색 배경 유지) */}
      <div className="relative flex flex-col flex-1 w-full bg-white">
        {' '}
        {/* overflow-x-hidden 추가 */}
        <Header /> {/* Header 컴포넌트 사용 */}
        {/* 메인 컨텐츠 */}
        <main className="flex-1 w-full pt-14 pb-16">
          <Outlet />
        </main>
        {/* 하단 네비게이션 */}
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-white border-t border-gray-200"
          style={{
            maxWidth: '768px',
            width: '100%',
            minWidth: 'min(320px, 100%)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <div className="grid grid-cols-5 h-16">
            {[
              { icon: '🏠', label: '홈' },
              { icon: '📦', label: '데스크' },
              { icon: '✏️', label: '특가' },
              { icon: '💬', label: '게시판' },
              { icon: '👤', label: '로그인' },
            ].map((item, i) => (
              <button key={i} className="flex flex-col items-center justify-center space-y-1">
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default RootLayout;
