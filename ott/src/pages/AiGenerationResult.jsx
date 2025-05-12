import React, { useEffect, useState } from 'react';
import axiosInstance from '@/api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/common/TopBar';
import SimpleModal from '@/components/common/SimpleModal';

const AIGeneratedResult = () => {
  const { imageId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForbiddenModal, setShowForbiddenModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get(`/ai-images/${imageId}`)
      .then((res) => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log('에러 발생:', err);
        setLoading(false);
        if (err.response && err.response.status === 403) {
          console.log('403 에러');
          setShowForbiddenModal(true);
        } else {
          // 다른 에러는 그냥 빈 객체로 (렌더링 시 체크 필요)
          setData(null);
        }
      });
  }, [imageId]);

  // 로딩 중이면 로딩 표시
  if (loading) return <div className="flex justify-center items-center h-screen">로딩중...</div>;

  // 모달이 열려있고 데이터가 없으면 모달만 보여줌
  if (showForbiddenModal) {
    return (
      <div className="max-w-[640px] mx-auto min-h-screen bg-white pb-20">
        <TopBar title="데스크 아이템 추천" showBackButton />
        <SimpleModal
          open={showForbiddenModal}
          message="해당 게시글을 조회할 권한이 없습니다."
          onClose={() => {
            setShowForbiddenModal(false);
            navigate(-1);
          }}
        />
      </div>
    );
  }

  // 데이터가 없으면 에러 표시 또는 다른 대체 UI
  if (!data) {
    return (
      <div className="max-w-[640px] mx-auto min-h-screen bg-white pb-20">
        <TopBar title="데스크 아이템 추천" showBackButton />
        <p className="text-center">데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 정상적인 데이터가 있는 경우의 UI
  return (
    <div className="max-w-[640px] mx-auto min-h-screen bg-white pb-20">
      <TopBar title="데스크 아이템 추천" showBackButton />

      {/* AI 생성 이미지 */}
      <div className="p-4 flex flex-col items-center">
        <div className="relative w-full max-w-lg aspect-square bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
          <img
            src={data.image.afterImagePath}
            alt="AI 생성 이미지"
            className="object-contain w-full h-full"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          생성된 이미지와 추천 아이템은 마이페이지에서 다시 확인할 수 있습니다.
        </p>
      </div>

      {/* 추천 상품 리스트 */}
      <div className="px-4">
        {data.products.map((product, idx) => (
          <div
            key={product.productId}
            className={`flex items-center w-full py-5 border-b last:border-b-0 cursor-pointer`}
            onClick={() => window.open(product.purchaseLink, '_blank')}
          >
            <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
              <img
                src={product.imagePath}
                alt={product.productName}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="ml-4 flex-1 text-left">
              <div className="font-bold text-base">{product.productName}</div>
              <div className="text-xs text-gray-500">
                {Number(product.price).toLocaleString()}원
              </div>
            </div>
            {/* 스크랩 버튼 */}
            <button
              type="button"
              aria-label={product.scraped ? '스크랩 해제' : '스크랩'}
              className="ml-2 w-8 h-8 flex items-center justify-center"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                console.log('스크랩 버튼 클릭');
              }}
            >
              {product.scarped ? (
                <svg className="w-6 h-6" fill="#222" viewBox="0 0 24 24">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="#222"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* 하단 안내 버튼 */}
      <div className="w-full max-w-[640px] px-4 mx-auto mt-8">
        <div className="bg-gray-200 rounded-xl py-3 text-center text-gray-700 text-base">
          게시글 작성하러 가기
        </div>
      </div>
    </div>
  );
};

export default AIGeneratedResult;
