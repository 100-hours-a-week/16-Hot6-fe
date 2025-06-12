import logo from '@/assets/images/logo/logo.svg';
import SimpleModal from '@/components/common/SimpleModal';
import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ showModal, setShowModal }) => {
  // 모달 표시 핸들러
  const handleShowModal = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };

  return (
    <>
      <header
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full bg-white z-50"
        style={{
          maxWidth: '768px',
          width: '100%',
          minWidth: 'min(320px, 100%)',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div className="h-14 flex items-center justify-between px-4">
          {/* text-inherit로 부모의 텍스트 색상을 상속받도록 수정 */}
          <Link
            to="/"
            className="flex items-center text-inherit text-gray-900"
            aria-label="홈으로 이동"
          >
            <img src={logo} alt="OnTheTop" className="h-6" />
            <span className="ml-2 font-semibold">OnTheTop</span>
          </Link>

          {/* 알림 아이콘 */}
          <button className="p-2" aria-label="알림" onClick={handleShowModal}>
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
      </header>
      <SimpleModal
        open={showModal}
        title="⚒️ 서비스 준비중"
        onClose={() => setShowModal(false)}
        message={`서비스 준비중입니다.\n 곧 더 나은 모습으로 찾아뵙겠습니다.`}
      />
    </>
  );
};

export default Header;
