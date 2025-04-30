import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="pt-38">
      {' '}
      {/* 헤더 높이만큼 패딩 */}
      {/* 메인 배너 섹션 */}
      <section className="mb-12">
        <div className="max-w-[1256px] mx-auto px-4">
          <div className="relative aspect-[16/7] rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500">
              {/* 실제 배너 이미지로 교체 필요 */}
            </div>
            <div className="relative z-10 h-full flex items-center justify-center text-white">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">메인 배너 타이틀</h1>
                <p className="text-lg">서브 텍스트가 들어갈 자리입니다</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 오늘의 딜 섹션 */}
      <section className="mb-12">
        <div className="max-w-[1256px] mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">오늘의 딜</h2>
            <Link to="/deals" className="text-sm text-gray-600 hover:text-blue-500">
              더보기
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {Array(4)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                    <img
                      src={`https://via.placeholder.com/300`}
                      alt="상품 이미지"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <span className="text-white font-bold">30%</span>
                    </div>
                  </div>
                  <h3 className="font-medium mb-1 line-clamp-2">상품명이 들어갈 자리입니다</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-500 font-bold">30%</span>
                    <span className="font-bold">99,000원</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <span className="flex items-center">⭐ 4.5</span>
                    <span className="mx-1">·</span>
                    <span>리뷰 999</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
      {/* 인기 집들이 섹션 */}
      <section className="mb-12">
        <div className="max-w-[1256px] mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">인기 집들이</h2>
            <Link to="/houses" className="text-sm text-gray-600 hover:text-blue-500">
              더보기
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {Array(3)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3">
                    <img
                      src={`https://via.placeholder.com/400x300`}
                      alt="집들이 이미지"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                    <span className="font-medium">사용자님의 집</span>
                  </div>
                  <h3 className="font-medium line-clamp-2">24평 신혼집 인테리어 완성했어요!</h3>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
