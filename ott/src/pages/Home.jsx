import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
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
          <h1 className="text-xl font-bold mb-2">데스크테리어를 완성하세요</h1>
          <button className="w-full py-3 bg-gray-400 text-white rounded-lg font-medium">
            데스크테리어 생성
          </button>
          <p className="text-sm text-gray-600 mt-4 text-center">
            매일 100명의 사람들이, OnTheTop을 통해 영감을 얻고 있습니다.
          </p>
        </div>
      </section>
      {/* 추천 섹션 */}
      <section className="mb-8">
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">이런 사진 찾고 있나요?</h2>
            <button className="text-gray-900">
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
          <div className="grid grid-cols-2 gap-4">
            {Array(2)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
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
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-white text-sm">내용 설명</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
      {/* 추천 아이템 섹션 */}
      <section className="mb-8">
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">오늘의 추천 아이템을 구경해보세요</h2>
            <button className="text-gray-900">
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
          <div className="grid grid-cols-2 gap-4">
            {Array(2)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-square bg-gray-100 rounded-lg relative">
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
                  <h3 className="font-medium">레트로 플립 탁상시계</h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">특가</span>
                    <span className="text-sm">대구</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
      {/* 오늘의 특가 섹션 */}
      <section>
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">오늘의 특가</h2>
            <button className="text-gray-900">
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
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">대구</span>
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
