import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/api/axios';
import SimpleModal from '@/components/common/SimpleModal';
import useDeskAICheck from '@/hooks/useDeskAICheck';
import mainImage from '@/assets/images/main.webp';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainData, setMainData] = useState({
    popularSetups: [],
    recommendedItems: [],
    todayDeals: [],
  });
  const { checkDeskAIAvailability, modal, setModal } = useDeskAICheck();
  const [showModal, setShowModal] = useState(false);

  // 메인 데이터 조회
  useEffect(() => {
    const fetchMainData = async () => {
      try {
        const response = await axiosInstance.get('/main');
        setMainData(response.data.data);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        console.error('메인 데이터 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMainData();
  }, []);

  // 모달 표시 핸들러
  const handleShowModal = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };

  // 스크랩 토글 핸들러
  const handleScrap = async (type, id) => {
    try {
      // 스크랩 API 호출 로직 추가 필요
      setMainData((prev) => ({
        ...prev,
        [type]: prev[type].map((item) =>
          item[type === 'popularSetups' ? 'postId' : 'itemId'] === id
            ? { ...item, scrapped: !item.scrapped }
            : item,
        ),
      }));
    } catch (err) {
      console.error('스크랩 처리 실패:', err);
    }
  };

  const handleDeskClick = async () => {
    const isAvailable = await checkDeskAIAvailability();
    if (isAvailable) {
      navigate('/desk');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto min-h-screen bg-white pb-24">
      <SimpleModal
        open={modal.open}
        message={modal.message}
        onClose={() => setModal({ open: false, message: '' })}
      />

      {/* 메인 이미지 섹션 */}
      <section className="px-4 mb-8">
        <div className="max-w-md mx-auto rounded-2xl overflow-hidden bg-gray-100 p-6 flex flex-col items-center">
          <div className="relative w-full max-w-sm aspect-[16/9] rounded-lg mb-4">
            <img
              src={mainImage}
              alt="데스크 셋업"
              className="absolute inset-0 w-full h-full object-contain rounded-lg"
            />
          </div>
          <h1 className="text-xl font-bold mb-2 text-center">데스크테리어를 완성하세요</h1>
          <div className="w-full flex justify-center">
            <button
              className="max-w-[280px] w-full py-3 bg-gray-400 text-white rounded-lg font-medium"
              onClick={handleDeskClick}
            >
              데스크테리어 생성
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            매일 100명의 사람들이, OnTheTop을 통해 영감을 얻고 있습니다.
          </p>
        </div>
      </section>
      {/* 추천 섹션 */}
      <section className="mb-8">
        <div className="px-4">
          {/* 제목과 더보기 버튼이 있는 헤더 */}
          <div className="mb-2 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">이런 사진을 찾고 있나요?</h2>
              <p className="text-gray-600 text-sm">인기 있는 데스크 셋업을 추천해드려요.</p>
            </div>
            <button onClick={handleShowModal} className="text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          {/* 스크롤 가능한 카드 컨테이너 */}
          <div className="relative">
            <div
              className="flex overflow-x-auto gap-3 no-scrollbar"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x mandatory',
              }}
            >
              {/* 추천 아이템 카드들 */}
              {mainData.popularSetups.map((setup) => (
                <div
                  key={setup.postId}
                  className="flex-none w-[180px] border rounded-lg overflow-hidden relative"
                  onClick={() => navigate(`/posts/${setup.postId}`)}
                >
                  {/* 스크랩 버튼 */}
                  <button
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScrap('popularSetups', setup.postId);
                    }}
                  >
                    {setup.scrapped ? (
                      <svg className="w-5 h-5" fill="#2563eb" stroke="#2563eb" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    )}
                  </button>
                  {/* 썸네일 */}
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={setup.thumbnailUrl}
                      alt={setup.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium truncate">{setup.title}</h3>
                  </div>
                </div>
              ))}
              {/* 더보기 카드 */}
              <div className="flex-none w-[180px] relative aspect-square bg-white flex items-center justify-center">
                <button onClick={handleShowModal} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-600">더보기</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 추천 아이템 섹션 */}
      <section className="mb-8">
        <div className="px-4">
          <div className="mb-2 flex justify-between items-center">
            <h2 className="text-xl font-bold">오늘의 추천 아이템을 구경해보세요</h2>
            <button onClick={handleShowModal} className="text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          {/* 가로 스크롤 컨테이너 */}
          <div className="relative">
            <div className="flex overflow-x-auto scrollbar-hide gap-3 -mx-4 px-4">
              {/* 아이템 카드 6개 */}
              {mainData.recommendedItems.map((item) => (
                <div
                  key={item.itemId}
                  className="flex-none w-[180px] border rounded-lg overflow-hidden relative"
                  onClick={() => window.open(item.purchaseUrl, '_blank')}
                >
                  {/* 스크랩 버튼 */}
                  <button
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScrap('recommendedItems', item.itemId);
                    }}
                  >
                    {item.scrapped ? (
                      <svg className="w-5 h-5" fill="#2563eb" stroke="#2563eb" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    )}
                  </button>
                  {/* 썸네일 */}
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium truncate">{item.productName}</h3>
                    <p className="text-sm text-gray-500">{item.seller}</p>
                    <p className="text-xs text-gray-400">{item.subCategory}</p>
                  </div>
                </div>
              ))}
              {/* 더보기 카드 */}
              <div className="flex-none w-[180px] relative aspect-square bg-white flex items-center justify-center">
                <button onClick={handleShowModal} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-600">더보기</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 오늘의 특가 섹션 */}
      <section>
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">오늘의 특가</h2>
            <button onClick={handleShowModal} className="text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            {mainData.todayDeals && mainData.todayDeals.length > 0
              ? // 실제 데이터가 있을 때 렌더링
                mainData.todayDeals.map((deal) => (
                  <div
                    key={deal.itemId}
                    className="flex items-center space-x-4 bg-white rounded-lg p-4 border border-gray-200"
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0">
                      <img
                        src={deal.imageUrl}
                        alt={deal.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{deal.productName}</h3>
                      <p className="text-sm text-gray-600 mb-2">{deal.price.toLocaleString()}원</p>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">특가</span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {deal.subCategory}
                        </span>
                      </div>
                    </div>
                    <button
                      className="w-8 h-8 flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScrap('todayDeals', deal.itemId);
                      }}
                    >
                      {deal.scrapped ? (
                        <svg
                          className="w-5 h-5"
                          fill="#2563eb"
                          stroke="#2563eb"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                ))
              : // 더미 데이터 렌더링
                Array(2)
                  .fill(null)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 bg-white rounded-lg p-4 border border-gray-200"
                      onClick={handleShowModal}
                    >
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">레트로 플립 탁상시계</h3>
                        <p className="text-sm text-gray-600 mb-2">1,000 Point</p>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">특가</span>
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">시계</span>
                        </div>
                      </div>
                      <button className="w-8 h-8 flex items-center justify-center">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
          </div>
        </div>
      </section>
      {/* SimpleModal */}
      <SimpleModal
        open={showModal}
        title="⚒️ 서비스 준비중"
        onClose={() => setShowModal(false)}
        message={`서비스 준비중입니다.\n 곧 더 나은 모습으로 찾아뵙겠습니다.`}
      />
    </div>
  );
};

export default Home;
