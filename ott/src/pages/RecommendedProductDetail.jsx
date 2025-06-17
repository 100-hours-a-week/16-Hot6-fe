import { addScrap, removeScrap } from '@/api/scraps';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Toast from '@/components/common/Toast';
import { getConfig } from '@/config/index';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const { BASE_URL } = getConfig();

const axiosBaseInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

// 요청 인터셉터
axiosBaseInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log('error 인터셉트', error);
    return Promise.reject(error);
  },
);

export default function RecommendedProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState('');

  // 상품 정보 불러오기
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosBaseInstance.get(`/desk-products/${productId}`);
        setProduct(response.data.data);
      } catch {
        setError('상품 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // 스크랩 토글
  const handleScrap = async () => {
    try {
      if (product.scrapped) {
        await removeScrap({ type: 'PRODUCT', targetId: product.productId });
        setToast('스크랩이 취소되었어요.');
      } else {
        await addScrap({ type: 'PRODUCT', targetId: product.productId });
        setToast('스크랩이 추가되었어요.');
      }
      setProduct((prev) => ({
        ...prev,
        scrapped: !prev.scrapped,
      }));
    } catch (err) {
      if (err.response?.status === 401) return;
      setToast('전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setTimeout(() => setToast(''), 1500);
    }
  };

  // 구매 링크로 이동
  const handlePurchase = () => {
    window.open(product.purchaseUrl, '_blank');
  };

  // 로딩 중일 때
  if (loading) {
    return <LoadingSpinner />;
  }

  // 에러가 있을 때
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // 상품이 없을 때
  if (!product) {
    return null;
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white">
      {/* 상품 이미지 */}
      <div className="w-full aspect-[3/3] bg-gray-100 flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.productName}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-gray-400">이미지 없음</span>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="px-4 pt-4 pb-2">
        {/* 상품명 + 카테고리 */}
        <h1 className="text-2xl font-bold mb-2">{product.productName}</h1>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
              {product.subCategory}
            </span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
              {product.purchasePlace}
            </span>
          </div>
          {/* 스크랩 버튼 */}
          <button
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
            onClick={handleScrap}
          >
            {product.scrapped ? (
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
        </div>

        {/* 가격 */}
        <div className="text-xl font-bold text-blue-600 mb-4">
          {Number(product.price).toLocaleString()}원
        </div>

        {/* 구매하러 가기 버튼 */}
        <button
          className="w-full py-3 bg-gray-700 text-white rounded-lg font-semibold mb-0"
          onClick={handlePurchase}
        >
          구매하러 가기
        </button>
      </div>
      <Toast message={toast} />
    </div>
  );
}
