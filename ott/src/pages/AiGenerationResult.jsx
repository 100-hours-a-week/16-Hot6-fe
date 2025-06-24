import axiosInstance from '@/api/axios';
import { addScrap, removeScrap } from '@/api/scraps';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SimpleModal from '../components/common/SimpleModal';
import Toast from '../components/common/Toast';
import TopBar from '../components/common/TopBar';

const AIGeneratedResult = () => {
  const { imageId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForbiddenModal, setShowForbiddenModal] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [toast, setToast] = useState('');

  // 컨테이너 크기 업데이트
  useEffect(() => {
    if (containerRef.current) {
      const updateSize = () => {
        // 크기 업데이트는 필요 없으므로 제거
      };
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  useEffect(() => {
    axiosInstance
      .get(`/ai-images/${imageId}`)
      .then((res) => {
        setData({
          image: res.data.data.image,
          products: res.data.data.products,
        });
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

  // 스크랩 토글 핸들러
  const handleScrap = async (productId, scraped) => {
    try {
      if (scraped) {
        await removeScrap({ type: 'PRODUCT', targetId: productId });
        setToast('스크랩이 취소되었어요.');
      } else {
        await addScrap({ type: 'PRODUCT', targetId: productId });
        setToast('스크랩이 추가되었어요.');
      }
      setData((prev) => ({
        ...prev,
        products: prev.products.map((product) =>
          product.productId === productId ? { ...product, scraped: !scraped } : product,
        ),
      }));
    } catch (err) {
      if (err.response?.status === 401) return;
      setToast('스크랩 상태를 변경할 수 없습니다.');
    } finally {
      setTimeout(() => setToast(''), 1500);
    }
  };

  // 상품 그룹화 함수
  const groupProductsByPosition = (products) => {
    const groups = {};
    products.forEach((product) => {
      if (product.centerX === null && product.centerY === null) {
        if (!groups.others) {
          groups.others = [];
        }
        groups.others.push(product);
      } else {
        // 좌표가 0이더라도 유효한 좌표로 처리
        const key = `${product.centerX},${product.centerY}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(product);
      }
    });
    return groups;
  };

  // 좌표를 픽셀 위치로 변환하는 함수
  const getPixelPosition = (x, y) => {
    // 이미지의 실제 크기 (예: 1024x1024)
    const imageWidth = 1024;
    const imageHeight = 1024;

    // 좌표를 픽셀 위치로 변환 (0~1024 범위의 좌표를 퍼센트로 변환)
    const pixelX = (x / imageWidth) * 100;
    const pixelY = (y / imageHeight) * 100;

    return { x: pixelX, y: pixelY };
  };

  // 상품 클릭 핸들러
  const handleProductClick = (products) => {
    setSelectedProductIds(products.map((p) => p.productId));
  };

  // 렌더링 시
  const selectedProducts =
    data && selectedProductIds.length > 0
      ? data.products.filter((p) => selectedProductIds.includes(p.productId))
      : null;

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
        <div
          ref={containerRef}
          className="relative w-full max-w-lg aspect-square bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center"
        >
          <img
            src={data.image.afterImagePath}
            alt="AI 생성 이미지"
            className="object-contain w-full h-full"
          />
          {/* 클릭 가능한 동그라미 표시 */}
          {Object.entries(groupProductsByPosition(data.products)).map(([key, products]) => {
            if (key === 'others') return null;
            const [x, y] = key.split(',').map(Number);
            const position = getPixelPosition(x, y);

            return (
              <div
                key={key}
                className="absolute w-6 h-6 bg-blue-500 bg-opacity-80 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:bg-opacity-70 transition-all flex items-center justify-center"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
                onClick={() => handleProductClick(products)}
              >
                <div className="w-4 h-4 relative">
                  <div className="absolute w-4 h-0.5 bg-white top-1/2 -translate-y-1/2"></div>
                  <div className="absolute h-4 w-0.5 bg-white left-1/2 -translate-x-1/2"></div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          생성된 이미지와 추천 아이템은 마이페이지에서 다시 확인할 수 있습니다.
        </p>
      </div>

      {/* 기타 상품 보기 버튼 */}
      {groupProductsByPosition(data.products).others && (
        <div className="px-4 mb-4">
          <button
            className="w-full bg-gray-100 hover:bg-gray-200 rounded-xl py-3 text-center text-gray-800 text-base transition-colors"
            onClick={() => handleProductClick(groupProductsByPosition(data.products).others)}
          >
            기타 상품 보기
          </button>
        </div>
      )}

      {/* 선택된 상품 리스트 */}
      {selectedProducts && (
        <div className="px-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">추천 상품</h3>
          </div>
          {selectedProducts.map((product) => (
            <div
              key={product.productId}
              className="flex items-center w-full py-5 border-b last:border-b-0 cursor-pointer"
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleScrap(product.productId, product.scraped);
                }}
              >
                {product.scraped ? (
                  <svg className="w-6 h-6" fill="#2563eb" stroke="#2563eb" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
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
          ))}
        </div>
      )}

      {/* 하단 안내 버튼 */}
      {!data.image.postId && (
        <div className="fixed bottom-1 left-1/2 -translate-x-1/2 w-full max-w-[580px] px-4 mx-auto mt-8">
          <button
            className="w-full bg-gray-800 rounded-xl py-3 text-center text-white text-base"
            onClick={() => navigate(`/post-editor?imageId=${data.image.imageId}`)}
          >
            게시글 작성하러 가기
          </button>
        </div>
      )}

      <Toast message={toast} />
    </div>
  );
};

export default AIGeneratedResult;
