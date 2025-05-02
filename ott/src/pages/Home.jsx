import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* 메인 이미지 섹션 */}
      <section className="px-4 mb-8">
        <div className="rounded-2xl overflow-hidden bg-gray-100 p-6">
          <img
            src="/path-to-desk-setup-image.jpg"
            alt="데스크 셋업"
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <h1 className="text-xl font-bold mb-2 text-center">데스크테리어를 완성하세요</h1>
          <div className="flex justify-center">
            <button className="max-w-[280px] w-full py-3 bg-gray-400 text-white rounded-lg font-medium">
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
            <button onClick={() => navigate('/items')} className="text-gray-900">
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
                '-ms-overflow-style': 'none',
                WebkitOverflowScrolling: 'touch', // 부드러운 스크롤 지원
                scrollSnapType: 'x mandatory', // 스크롤 스냅 효과
              }}
            >
              {/* 추천 아이템 카드들 */}
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="flex-none w-[180px] border rounded-lg overflow-hidden relative"
                >
                  {/* 스크랩 버튼 */}
                  <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                  {/* 카드 내용 */}
                  <div className="aspect-square bg-gray-100"></div>
                  <div className="p-3">
                    <h3 className="font-medium">데스크 셋업 {index + 1}</h3>
                    <p className="text-gray-600 text-sm">설명글이 들어갑니다.</p>
                  </div>
                </div>
              ))}
              {/* 더보기 카드 */}
              <div className="flex-none w-[180px] relative aspect-square bg-white flex items-center justify-center">
                <button
                  onClick={() => navigate('/items')}
                  className="flex flex-col items-center gap-2"
                >
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
            <button onClick={() => navigate('/items')} className="text-gray-900">
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
              {Array(7)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="flex-none w-[180px]">
                    <div className="aspect-square bg-gray-100 rounded-lg relative mb-2">
                      <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
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
                    <h3 className="font-medium text-sm">레트로 플립 탁상시계</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">특가</span>
                      <span className="text-xs text-gray-600">키보드</span>
                    </div>
                  </div>
                ))}
              {/* 더보기 카드 */}
              <div className="flex-none w-[180px] relative aspect-square bg-white flex items-center justify-center">
                <button
                  onClick={() => navigate('/items')}
                  className="flex flex-col items-center gap-2"
                >
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
            <h2 className="text-lg font-bold">오늘의 특가</h2>
            <button onClick={() => navigate('/items')} className="text-gray-900">
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
            {Array(2)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 bg-white rounded-lg p-4 border border-gray-200"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">레트로 플립 탁상시계</h3>
                    <p className="text-sm text-gray-600 mb-2">1,000 Point</p>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">특가</span>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">마우스</span>
                    </div>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>
  );
};

export default Home;
