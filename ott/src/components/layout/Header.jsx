import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50">
      {/* 최상단 유틸리티 바 */}
      <div className="h-10 border-b border-gray-100">
        <div className="max-w-[1256px] mx-auto px-4 h-full flex items-center justify-end text-sm">
          <nav className="flex items-center space-x-3">
            <Link to="/write" className="text-gray-800 hover:text-blue-500">
              글쓰기
            </Link>
            <Link to="/login" className="text-gray-800 hover:text-blue-500">
              로그인
            </Link>
            <Link to="/signup" className="text-gray-800 hover:text-blue-500">
              회원가입
            </Link>
            <Link to="/customer-service" className="text-gray-800 hover:text-blue-500">
              고객센터
            </Link>
          </nav>
        </div>
      </div>

      {/* 메인 네비게이션 */}
      <div className="h-16 border-b border-gray-100">
        <div className="max-w-[1256px] mx-auto px-4 h-full flex items-center">
          {/* 로고 */}
          <Link to="/" className="mr-8">
            <span className="text-xl font-bold">OTT</span>
          </Link>

          {/* 메인 메뉴 */}
          <div className="flex-1 flex items-center">
            <nav className="flex items-center space-x-8">
              <Link to="/" className="font-medium text-blue-500">
                홈
              </Link>
              <Link to="/following" className="font-medium text-gray-800 hover:text-blue-500">
                추천
              </Link>
              <Link to="/store" className="font-medium text-gray-800 hover:text-blue-500">
                스토어
              </Link>
              <Link to="/experts" className="font-medium text-gray-800 hover:text-blue-500">
                전문가
              </Link>
            </nav>

            {/* 검색창 */}
            <div className="ml-auto max-w-md w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="통합검색"
                  className="w-full h-10 pl-4 pr-10 rounded-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* 장바구니/알림 아이콘 */}
            <div className="ml-6 flex items-center space-x-3">
              <button className="p-2 hover:text-blue-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </button>
              <button className="p-2 hover:text-blue-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 서브 네비게이션 */}
      <div className="h-12 border-b border-gray-100">
        <div className="max-w-[1256px] mx-auto px-4 h-full flex items-center">
          <nav className="flex items-center space-x-6 text-sm">
            <Link to="/category/1" className="text-gray-800 hover:text-blue-500">
              홈
            </Link>
            <Link to="/category/2" className="text-gray-800 hover:text-blue-500">
              꿀템발견
            </Link>
            <Link to="/category/3" className="text-gray-800 hover:text-blue-500">
              집들이
            </Link>
            <Link to="/category/4" className="text-gray-800 hover:text-blue-500">
              집사진
            </Link>
            <Link to="/category/5" className="text-gray-800 hover:text-blue-500">
              살림수납
            </Link>
            <Link to="/category/6" className="text-gray-800 hover:text-blue-500">
              시공일기
            </Link>
            <Link to="/category/7" className="text-gray-800 hover:text-blue-500">
              3D인테리어
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
