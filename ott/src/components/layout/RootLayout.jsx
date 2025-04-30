import React from 'react';
import { Outlet } from 'react-router-dom';

const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white shadow">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="h-16 flex items-center justify-between">
            {/* 네비게이션 내용 */}
            <div>로고</div>
            <div>메뉴</div>
          </nav>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 w-full">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-100">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 푸터 내용 */}
            <div>푸터 섹션 1</div>
            <div>푸터 섹션 2</div>
            <div>푸터 섹션 3</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
