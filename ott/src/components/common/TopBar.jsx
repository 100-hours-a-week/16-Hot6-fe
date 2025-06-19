'use client';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ title, onBackClick, className = '', showBack = true }) => {
  const navigate = useNavigate();
  const [shadowStyle, setShadowStyle] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      // 스크롤 위치에 따라 alpha/blur 계산 (최대 0.08, blur 8px)
      const y = Math.min(window.scrollY, 80); // 0~80px까지만 반영
      const alpha = 0.08 * (y / 80);
      const blur = 2 + 6 * (y / 80); // 2~8px
      setShadowStyle(
        y > 0
          ? {
              boxShadow: `0 2px ${blur}px 0 rgba(0,0,0,${alpha.toFixed(2)})`,
              transition: 'box-shadow 0.2s',
            }
          : { boxShadow: 'none', transition: 'box-shadow 0.2s' },
      );
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // mount 시 1회
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackClick = () => {
    if (onBackClick) onBackClick();
    else navigate(-1);
  };

  return (
    <div className={`mt-2 sticky top-0 w-full bg-white z-50 ${className}`} style={shadowStyle}>
      <div className="mx-auto flex items-center h-13 px-4">
        {showBack && (
          <button
            className="flex items-center justify-center p-2 -ml-2"
            onClick={handleBackClick}
            aria-label="뒤로 가기"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-800">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <h1 className="flex-1 text-xl font-semibold text-center -translate-x-4">{title}</h1>
      </div>
    </div>
  );
};

export default TopBar;
