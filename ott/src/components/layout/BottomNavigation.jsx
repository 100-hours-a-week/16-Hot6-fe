import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

const BottomNavigation = ({ onDeskClick }) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigationItems = [
    {
      path: '/',
      icon: '🏠',
      label: '홈',
      // 아이콘 컴포넌트로 대체 가능
      // icon: <HomeIcon className="w-6 h-6" />
    },
    {
      path: '/desk',
      icon: '📦',
      label: '데스크',
    },
    {
      path: '/upload',
      icon: '✏️',
      label: '특가',
    },
    {
      path: '/community',
      icon: '💬',
      label: '게시판',
    },
    {
      path: isAuthenticated ? '/mypage' : '/login',
      icon: '👤',
      label: isAuthenticated ? '내 정보' : '로그인',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] bg-white border-t border-gray-200 safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) =>
          item.label === '데스크' ? (
            <button
              key={item.path}
              onClick={onDeskClick}
              className={`flex flex-col items-center justify-center space-y-1 w-full h-full ${
                location.pathname === item.path ? 'text-blue-500' : 'text-gray-500'
              }`}
              type="button"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-1 ${
                location.pathname === item.path ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ),
        )}
      </div>
    </nav>
  );
};

export default BottomNavigation;
