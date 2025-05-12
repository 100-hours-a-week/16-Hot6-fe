import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

// SVG 아이콘 import
import homeOutlinedIcon from '@/assets/icons/navigation/home-outlined.svg';
import homeFilledIcon from '@/assets/icons/navigation/home-filled.svg';
import deskOutlinedIcon from '@/assets/icons/navigation/sparkles-outlined.svg';
import deskFilledIcon from '@/assets/icons/navigation/sparkles-filled.svg';
import uploadOutlinedIcon from '@/assets/icons/navigation/fire-outlined.svg';
import uploadFilledIcon from '@/assets/icons/navigation/fire-filled.svg';
import postsOutlinedIcon from '@/assets/icons/navigation/chatbubbles-outlined.svg';
import postsFilledIcon from '@/assets/icons/navigation/chatbubbles-filled.svg';
import mypageOutlinedIcon from '@/assets/icons/navigation/person-outlined.svg';
import mypageFilledIcon from '@/assets/icons/navigation/person-filled.svg';

const BottomNavigation = ({ checkDeskAIAvailability }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const navigationItems = [
    {
      path: '/',
      icon: location.pathname === '/' ? homeFilledIcon : homeOutlinedIcon,
      label: '홈',
    },
    {
      path: '/desk',
      icon: location.pathname === '/desk' ? deskFilledIcon : deskOutlinedIcon,
      label: '데스크',
    },
    {
      path: '/upload',
      icon: location.pathname === '/upload' ? uploadFilledIcon : uploadOutlinedIcon,
      label: '특가',
    },
    {
      path: '/posts',
      icon: location.pathname === '/posts' ? postsFilledIcon : postsOutlinedIcon,
      label: '게시판',
    },
    {
      path: isAuthenticated ? '/mypage' : '/login',
      icon: location.pathname === '/mypage' ? mypageFilledIcon : mypageOutlinedIcon,
      label: isAuthenticated ? '내 정보' : '로그인',
    },
  ];

  const handleDeskClick = async () => {
    const isAvailable = await checkDeskAIAvailability();
    if (isAvailable) {
      navigate('/desk');
    }
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] bg-white border-t border-gray-200 safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) =>
          item.label === '데스크' ? (
            <button
              key={item.path}
              onClick={handleDeskClick}
              className={`flex flex-col items-center justify-center space-y-1 w-full h-full ${
                location.pathname === item.path ? 'text-blue-500' : 'text-gray-500'
              }`}
              type="button"
            >
              <img src={item.icon} alt={item.label} className="w-6 h-6" />
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
              <img src={item.icon} alt={item.label} className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ),
        )}
      </div>
    </nav>
  );
};

export default BottomNavigation;
