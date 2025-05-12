'use client';

import { useNavigate } from 'react-router-dom';

const TopBar = ({ title, onBackClick, className = '', showBack = true }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="mt-2 sticky top-0 w-full bg-white z-50">
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
