import React, { useState, useEffect } from 'react';
import axiosInstance from '@/api/axios';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SimpleModal from '@/components/common/SimpleModal';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

export default function MyPage() {
  // 사용자 정보 상태 관리
  const [userInfo, setUserInfo] = useState({
    nicknameCommunity: '',
    nicknameKakao: null,
    profileImagePath: '',
    point: 0,
    certified: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const navigate = useNavigate();
  const handleShowModal = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const withdraw = useAuthStore((state) => state.withdraw);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/users/me');
        setUserInfo(response.data.data);
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        setError('사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>
    );
  }

  // 포인트 3자리마다 콤마
  const formatPoint = (point) => point.toLocaleString() + 'P';

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white pb-24">
      {/* 프로필 영역 */}
      <div className="flex flex-col items-center py-6">
        <img
          src={userInfo.profileImagePath}
          alt="profile"
          className="w-[85px] h-[85px] rounded-full object-cover border"
        />
        <div className="mt-3 text-lg font-bold">{userInfo.nicknameCommunity} 님,</div>
        <div className="text-gray-500 text-base">데스크를 꾸며보세요!</div>
      </div>

      {/* 바로가기 버튼들 */}
      <div className="flex justify-center gap-8 py-4">
        <button className="flex flex-col items-center" onClick={handleShowModal}>
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
        <button className="flex flex-col items-center" onClick={handleShowModal}>
          <svg width="28" height="28" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span className="text-xs mt-1">스크랩</span>
        </button>
        <button className="flex flex-col items-center" onClick={handleShowModal}>
          <svg width="28" height="28" fill="#222" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
          <span className="text-xs mt-1">데스크</span>
        </button>
      </div>

      {/* 포인트/추천인 코드 */}
      <div className="mx-4 my-4 p-4 border rounded flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">{formatPoint(userInfo.point)}</div>
          <div className="text-xs text-gray-500 mt-1 cursor-pointer" onClick={handleShowModal}>
            {userInfo.certified ? '인증됨' : '추천인 코드 입력'}
          </div>
        </div>
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded text-sm font-semibold"
          onClick={handleShowModal}
        >
          포인트 내역
        </button>
      </div>

      {/* 메뉴 리스트 */}
      <div className="mt-4">
        <button
          className="w-full text-left px-4 py-4 border-b text-base "
          onClick={handleShowModal}
        >
          나의 게시글 보기
        </button>
        <button className="w-full text-left px-4 py-4 border-b text-base" onClick={handleShowModal}>
          구매내역 보기
        </button>
        <button
          className="w-full text-left px-4 py-4 border-b text-base"
          onClick={() => navigate('/profile-edit')}
        >
          회원정보 변경
        </button>
        <button className="w-full text-left px-4 py-4 border-b text-base">자주 묻는 질문</button>
        <button className="w-full text-left px-4 py-4 border-b text-base">문의하기</button>
        <button
          className="w-full text-left px-4 py-4 border-b text-base text-red-500"
          onClick={() => setIsWithdrawModalOpen(true)}
        >
          회원탈퇴
        </button>
      </div>

      <SimpleModal
        open={isModalOpen}
        title="⚒️ 서비스 준비중"
        message={`서비스 준비중입니다.\n 곧 더 나은 모습으로 찾아뵙겠습니다.`}
        onClose={() => setIsModalOpen(false)}
      />

      <SimpleModal
        open={isWithdrawModalOpen}
        title="회원탈퇴"
        message="정말로 탈퇴하시겠습니까?"
        leftButtonText="취소"
        rightButtonText="확인"
        onLeftClick={() => setIsWithdrawModalOpen(false)}
        onRightClick={() => {
          withdraw(navigate);
          setIsWithdrawModalOpen(false);
        }}
        onClose={() => setIsWithdrawModalOpen(false)}
      />
    </div>
  );
}
