import axiosInstance from '@/api/axios';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SimpleModal from '@/components/common/SimpleModal';
import Header from '@/components/layout/Header';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyPage() {
  console.log('MyPage 컴포넌트 렌더링');
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
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);
  const [recommendationCode, setRecommendationCode] = useState('');
  const [nicknameKakao, setNicknameKakao] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [recommendationError, setRecommendationError] = useState(null);
  const navigate = useNavigate();

  const surveyUrl = 'https://forms.gle/YSV9DpJ1U3Cc1Dzw9';

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
    console.log('MyPage: Loading...');
    return <LoadingSpinner />;
  }

  if (error) {
    console.log('MyPage: Error', error);
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>
    );
  }

  // 포인트 3자리마다 콤마
  const formatPoint = (point) => point.toLocaleString() + 'P';

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white pb-24">
      <Header showModal={showModal} setShowModal={setShowModal} />
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
      <div className="flex justify-between gap-8 py-4">
        <div className="flex-1 flex justify-end">
          <button
            className="flex flex-col items-center"
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
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
        </div>
        <div className="flex-1 flex justify-center">
          <button className="flex flex-col items-center" onClick={() => navigate('/my-scraps')}>
            <svg
              width="28"
              height="28"
              fill="none"
              stroke="#222"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="text-xs mt-1">스크랩</span>
          </button>
        </div>
        <div className="flex-1 flex justify-start">
          <button className="flex flex-col items-center" onClick={() => navigate('/my-desks')}>
            <svg width="28" height="28" fill="#222" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            <span className="text-xs mt-1">나의 데스크</span>
          </button>
        </div>
      </div>

      {/* 포인트/인증 코드 */}
      <div className="mx-4 my-4 p-4 border rounded flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">{formatPoint(userInfo.point)}</div>
          <button
            type="button"
            className={`inline-flex items-center justify-center text-xs mt-1 cursor-pointer px-4 py-2 rounded transition-all duration-150
              ${userInfo.certified ? 'text-black bg-transparent pl-0' : 'text-white bg-gray-700'} min-w-[80px] w-auto`}
            style={{ width: 'auto' }}
            onClick={
              userInfo.certified
                ? undefined
                : (e) => {
                    e.stopPropagation();
                    setIsRecommendationModalOpen(true);
                  }
            }
            disabled={userInfo.certified}
          >
            {userInfo.certified ? '카테부 인증 완료' : '인증 코드 입력'}
          </button>
        </div>
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded text-sm font-semibold"
          onClick={() => navigate('/my-point-history')}
        >
          포인트 내역
        </button>
      </div>

      {/* 메뉴 리스트 */}
      <div className="mt-4">
        <button
          className="w-full text-left px-4 py-4 border-b text-base "
          onClick={() => navigate('/my-posts')}
        >
          나의 게시글 보기
        </button>
        <button
          className="w-full text-left px-4 py-4 border-b text-base"
          onClick={() => navigate('/orders')}
        >
          주문내역 보기
        </button>
        <button
          className="w-full text-left px-4 py-4 border-b text-base"
          onClick={() => navigate('/profile-edit')}
        >
          회원정보 변경
        </button>
        <button
          className="w-full text-left px-4 py-4 border-b text-base"
          onClick={() => setShowModal(true)}
        >
          자주 묻는 질문
        </button>
        <button
          className="w-full text-left px-4 py-4 border-b text-base"
          onClick={() => {
            window.open(surveyUrl, '_blank');
          }}
        >
          문의하기
        </button>
        {/* <button
          className="w-full text-left px-4 py-4 border-b text-base text-red-500"
          onClick={() => setIsWithdrawModalOpen(true)}
        >
          회원탈퇴
        </button> */}
      </div>

      <SimpleModal
        open={isRecommendationModalOpen}
        title="인증 코드 입력"
        message={
          <>
            <input
              type="text"
              value={recommendationCode}
              onChange={(e) => setRecommendationCode(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring text-sm mb-2"
              placeholder="인증 코드를 입력하세요"
              required
            />
            <input
              type="text"
              value={nicknameKakao}
              onChange={(e) => setNicknameKakao(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring text-sm mb-2"
              placeholder="카테부 닉네임을 입력하세요 (예: kakao.kim)"
              required
            />
            <div className="text-sm text-gray-500 mb-2">
              닉네임 사칭 시 책임은 본인에게 있습니다.
            </div>
            {recommendationError && (
              <div className="text-red-500 mb-2 text-center">{recommendationError}</div>
            )}
            {success && (
              <div className="text-green-500 mb-2 text-center">등록이 완료되었습니다!</div>
            )}
          </>
        }
        rightButtonText={'확인'}
        onClose={() => {
          setIsRecommendationModalOpen(false);
          setRecommendationError(null);
          setSuccess(false);
          setRecommendationCode('');
          setNicknameKakao('');
        }}
        onRightClick={async () => {
          if (loading) return;
          setLoading(true);
          setRecommendationError(null);
          try {
            await axiosInstance.post('/users/recommendation-code', {
              code: recommendationCode,
              nicknameKakao,
            });
            setSuccess(true);
            setTimeout(() => {
              setIsRecommendationModalOpen(false);
              setSuccess(false);
              setRecommendationCode('');
              setNicknameKakao('');
              window.location.reload();
            }, 500);
          } catch (error) {
            if (error.response && error.response.status === 400) {
              setRecommendationError('인증 코드가 유효하지 않습니다.');
            } else {
              setRecommendationError('인증 코드 등록에 실패했습니다.');
              setTimeout(() => {
                setIsRecommendationModalOpen(false);
                navigate('/my-page');
              }, 500);
            }
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
}
