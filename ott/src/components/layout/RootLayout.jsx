import LoginModal from '@/components/common/LoginModal';
import SimpleModal from '@/components/common/SimpleModal';
import Toast from '@/components/common/Toast';
import useDeskAICheck from '@/hooks/useDeskAICheck';
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Footer from './Footer'; // Footer import 추가
import Header from './Header'; // Header 컴포넌트 import

const RootLayout = () => {
  const { checkDeskAIAvailability, modal, setModal } = useDeskAICheck();
  const [toast, setToast] = useState('');
  const location = useLocation();

  const hideGlobalUI = location.pathname.startsWith('/orders/');

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
        {/* overflow-x-hidden 추가 */}
        {!hideGlobalUI && <Header />}
        {/* Header 컴포넌트 사용 */}
        {/* 메인 컨텐츠 */}
        <main className={`flex-1 w-full pb-16 relative${hideGlobalUI ? '' : ' pt-14'}`}>
          <Outlet context={{ toast, setToast }} />
        </main>
        <Footer /> {/* Footer 추가 */}
        {/* <ImageGenerationLoader /> */}
        {/* 하단 네비게이션 컴포넌트 */}
        {!hideGlobalUI && <Footer />}
        {!hideGlobalUI && <BottomNavigation checkDeskAIAvailability={checkDeskAIAvailability} />}
        <SimpleModal
          open={modal.open}
          message={modal.message}
          onClose={() => setModal({ open: false, message: '' })}
        />
        <LoginModal />
        <Toast message={toast} />
      </div>
    </div>
  );
};

export default RootLayout;
