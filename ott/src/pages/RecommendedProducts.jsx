import { addScrap, removeScrap } from '@/api/scraps';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Toast from '@/components/common/Toast';
import { getConfig } from '@/config/index';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default function RecommendedProducts() {
  const navigate = useNavigate();
  const [deskProducts, setDeskProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState('');
  const [pagination, setPagination] = useState({
    size: 10,
    lastWeight: null,
    lastDeskProductId: null,
    hasNext: true,
  });
  const [isFetching, setIsFetching] = useState(false);

  // 상품 불러오기 함수
  const fetchProducts = async (isFirst = false) => {
    if (isFetching || (!pagination.hasNext && !isFirst)) return;
    setIsFetching(true);
    try {
      const params = {
        size: pagination.size,
      };

      if (!isFirst) {
        params.lastWeight = pagination.lastWeight;
        params.lastDeskProductId = pagination.lastDeskProductId;
      }

      const res = await axiosBaseInstance.get('/desk-products', { params });
      const { deskProducts: newDeskProducts = [], pagination: newPagination = {} } =
        res.data.data || {};

      setDeskProducts((prev) => (isFirst ? newDeskProducts : [...prev, ...newDeskProducts]));
      setPagination(newPagination);
      setError(null);
    } catch {
      setError('상품 목록을 불러오지 못했습니다.');
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    let isFetchingMore = false;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      lastScrollY = currentScrollY;

      if (
        isScrollingDown &&
        window.innerHeight + currentScrollY >= document.body.offsetHeight - 200 &&
        pagination.hasNext &&
        !isFetching &&
        !isFetchingMore
      ) {
        isFetchingMore = true;
        fetchProducts().finally(() => {
          isFetchingMore = false;
        });
      }
    };

    let timeoutId;
    const debouncedHandleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(handleScroll, 200);
    };

    window.addEventListener('scroll', debouncedHandleScroll);
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [pagination, isFetching]);

  // 스크랩 토글
  const handleScrap = async (id) => {
    try {
      const product = deskProducts.find((product) => product.productId === id);
      if (product.scrapped) {
        await removeScrap({ type: 'PRODUCT', targetId: id });
        setToast('스크랩이 취소되었어요.');
      } else {
        await addScrap({ type: 'PRODUCT', targetId: id });
        setToast('스크랩이 추가되었어요.');
      }
      setDeskProducts((prev) =>
        prev.map((product) =>
          product.productId === id ? { ...product, scrapped: !product.scrapped } : product,
        ),
      );
    } catch (err) {
      if (err.response?.status === 401) return;
      setToast('전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setTimeout(() => setToast(''), 1500);
    }
  };

  // 첫 진입 시
  useEffect(() => {
    fetchProducts(true);
  }, []);

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

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white">
      {/* 상품 리스트 */}
      <div className="px-4 pt-4 space-y-4">
        {deskProducts.length === 0 ? (
          <div className="text-center text-gray-400 py-20">추천 제품이 없습니다.</div>
        ) : (
          deskProducts.map((product) => (
            <div
              key={product.productId}
              className="flex items-center space-x-4 bg-white rounded-lg p-4 border border-gray-200 cursor-pointer"
              onClick={() => navigate(`/recommended-products/${product.productId}`)}
            >
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.productName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-gray-400">이미지 없음</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">{product.productName}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {Number(product.price).toLocaleString()}원
                </p>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {product.subCategory}
                  </span>
                </div>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleScrap(product.productId);
                }}
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
          ))
        )}
      </div>
      <Toast message={toast} />
    </div>
  );
}
