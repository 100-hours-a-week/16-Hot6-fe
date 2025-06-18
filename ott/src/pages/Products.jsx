import { addScrap, removeScrap } from '@/api/scraps';
import { getConfig } from '@/config/index';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';

const FIRST_TABS = [
  { label: '전체상품', value: 'ALL' },
  // { label: '이벤트', value: 'EVENT' },
  { label: '오늘의 특가', value: 'PROMOTION' },
];

const SECOND_TABS = [
  { label: '전체', value: 'ALL' },
  { label: '마우스', value: 'MOUSE' },
  { label: '키보드', value: 'KEYBOARD' },
  { label: '손목받침대', value: 'WRISTREST' },
  { label: '무드등', value: 'MOODLIGHT' },
  { label: '북엔드', value: 'BOOKEND' },
  { label: '펜꽂이', value: 'PENHOLDER' },
  { label: '모니터받침대', value: 'MONITORSTAND' },
  { label: '컵받침', value: 'CUPHOLDER' },
];

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

const type = 'SERVICE_PRODUCT';

// 마감 타이머 계산 함수
function getTimeLeft(endAt) {
  if (!endAt) return null;
  const end = new Date(endAt);
  const now = new Date();
  let diff = Math.max(0, end - now);
  const h = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, '0');
  const m = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
  const s = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
  return `${h}:${m}:${s} 남음`;
}

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  // URL에서 초기값 읽기
  const initialFirstTab = searchParams.get('primary') || 'ALL';
  const initialSecondTab = searchParams.get('secondary') || 'ALL';

  const [firstTab, setFirstTab] = useState(initialFirstTab);
  const [secondTab, setSecondTab] = useState(initialSecondTab);
  const [products, setProducts] = useState([]);
  const [scrapLoading, setScrapLoading] = useState(null); // productId
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [pagination, setPagination] = useState({
    size: 10,
    lastProductId: null,
    hasNext: true,
  });
  const [timerTick, setTimerTick] = useState(0);
  const [toast, setToast] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // 반응형 버튼 위치를 위한 windowWidth 관리
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 상품 목록 API 호출 (isFirst: true면 초기화, false면 추가)
  const fetchProducts = async (isFirst = false) => {
    if (isFetching || (!pagination.hasNext && !isFirst)) return;
    setIsFetching(true);
    if (isFirst) setLoading(true);
    setError(null);
    try {
      const params = { size: pagination.size };
      if (!isFirst && pagination.lastProductId) {
        params.lastProductId = pagination.lastProductId;
      }
      if (firstTab === 'PROMOTION') {
        params.promotionType = 'BASIC';
      } else if (firstTab === 'ALL') {
        if (secondTab !== 'ALL') {
          params.productType = secondTab;
        }
      } else if (firstTab === 'EVENT') {
        // 이벤트 상품 등 필요시 추가
      }
      const res = await axiosBaseInstance.get('/products', { params });
      const data = res.data.data.products;
      const newPagination = res.data.data.pagination;
      const normalized = data.map((item) => ({
        productId: item.product_id,
        productName: item.product_name,
        productType: item.product_type,
        variantName: item.variant_name,
        imageUrl: item.image_url,
        originalPrice: item.original_price,
        discountPrice: item.discount_price,
        discountRate: item.discount_rate,
        availableQuantity: item.available_quantity,
        promotionEndAt: item.promotion_end_at,
        isPromotion: item.is_promotion,
        scraped: item.scraped,
        createdAt: item.created_at,
      }));
      setProducts((prev) => (isFirst ? normalized : [...prev, ...normalized]));
      setPagination({
        size: newPagination.size,
        lastProductId: newPagination.last_product_id,
        hasNext: newPagination.has_next,
      });
    } catch (err) {
      setError('상품을 불러오지 못했습니다.');
    } finally {
      setIsFetching(false);
      if (isFirst) setLoading(false);
    }
  };

  // 탭 변경 시 URL 쿼리파라미터 갱신
  useEffect(() => {
    const currentPrimary = searchParams.get('primary');
    const currentSecondary = searchParams.get('secondary');
    if (firstTab !== currentPrimary || secondTab !== currentSecondary) {
      const newParams = { ...Object.fromEntries(searchParams.entries()) };
      newParams.primary = firstTab;
      newParams.secondary = secondTab;
      setSearchParams(newParams, { replace: true });
    }
    // eslint-disable-next-line
  }, [firstTab, secondTab]);

  // 탭 클릭 핸들러
  const handleFirstTabClick = (tab) => {
    setFirstTab(tab);
    // 1차 탭이 바뀌면 2차 탭도 ALL로 초기화
    if (tab !== 'ALL') setSecondTab('ALL');
  };
  const handleSecondTabClick = (tab) => {
    setSecondTab(tab);
  };

  // 탭 변경 시 상품 목록/페이지네이션 초기화 후 새로고침
  useEffect(() => {
    setProducts([]);
    setPagination({ size: 10, lastProductId: null, hasNext: true });
    fetchProducts(true);
    // eslint-disable-next-line
  }, [firstTab, secondTab]);

  // 무한스크롤 + 스크롤 이벤트
  useEffect(() => {
    let isFetchingMore = false;
    const handleScroll = () => {
      // 최상단 이동 버튼 노출
      setShowScrollTop(window.scrollY > 200);
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        pagination.hasNext &&
        !isFetching &&
        !isFetchingMore
      ) {
        isFetchingMore = true;
        fetchProducts(false).finally(() => {
          isFetchingMore = false;
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pagination, isFetching, firstTab, secondTab]);

  // 최상단 이동 핸들러
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  // 1초마다 강제 리렌더링
  useEffect(() => {
    const interval = setInterval(() => setTimerTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // 스크랩 토글 핸들러
  const handleScrap = async (productId, scraped) => {
    setScrapLoading(productId);
    try {
      if (scraped) {
        await removeScrap({ type, targetId: productId });
      } else {
        await addScrap({ type, targetId: productId });
      }
      setProducts((prev) =>
        prev.map((p) => (p.productId === productId ? { ...p, scraped: !scraped } : p)),
      );
      setToast(scraped ? '스크랩이 취소되었어요.' : '스크랩이 추가되었어요.');
    } catch (err) {
      if (err.response?.status === 401) return;
      setToast('전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setTimeout(() => setToast(''), 1500);
      setScrapLoading(null);
    }
  };

  return (
    <div className="max-w-[640px] mx-auto min-h-screen bg-white pb-24">
      {/* 1차 탭 */}
      <div className="mt-4 px-4">
        <div className="flex border-b border-gray-200">
          {FIRST_TABS.map((tab) => (
            <button
              key={tab.value}
              className={`flex-1 py-2 text-sm font-medium ${firstTab === tab.value ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}
              onClick={() => handleFirstTabClick(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {/* 2차 탭 */}
      {firstTab === 'ALL' && (
        <div className="flex overflow-x-auto scrollbar-hide px-4 py-2 gap-2 bg-white sticky top-0 z-10">
          {SECOND_TABS.map((tab) => (
            <button
              key={tab.value}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border ${secondTab === tab.value ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-400 border-gray-200'}`}
              onClick={() => handleSecondTabClick(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      {/* 오늘 특가 안내 문구 */}
      {firstTab === 'PROMOTION' && (
        <div className="px-4 py-4 mb-2">
          <div className="text-xl font-bold mb-1">서비스 출시기념 매일 아침 10시 특가</div>
          <div className="text-gray-500 text-base">포인트로 특가상품을 구입해보세요!</div>
        </div>
      )}
      {/* 상품 리스트 */}
      <div className="px-4 py-2 flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-10">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-400 py-10">상품이 없습니다.</div>
        ) : (
          products.map((product) => (
            <div
              key={product.productId}
              className="relative flex items-center border-b pb-4 cursor-pointer hover:bg-gray-50 transition"
              onClick={() =>
                navigate(
                  `/products/${product.productId}?option=${encodeURIComponent(product.variantName)}`,
                )
              }
            >
              <div className="flex flex-col items-center gap-2 mr-4">
                {/* 오늘 특가 탭일 때만 타이머 */}
                {firstTab === 'PROMOTION' && product.promotionEndAt && (
                  <div className="flex justify-center">
                    <div className="inline-block bg-white text-red-500 text-xs font-bold px-3 py-1 rounded shadow">
                      {getTimeLeft(product.promotionEndAt)}
                    </div>
                  </div>
                )}
                {/* 상품 이미지 */}
                <div className="w-28 h-28 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
              </div>
              <div className="flex-1">
                {firstTab === 'PROMOTION' && (
                  <div className="flex gap-1 mb-1">
                    <span className="bg-gray-100 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                      특가
                    </span>
                  </div>
                )}
                {/* 상품명 */}
                <div className="font-semibold text-base mb-1">
                  {product.productName}, {product.variantName}
                </div>
                {/* originalPrice (취소선) */}
                {firstTab === 'PROMOTION' ? (
                  product.originalPrice && (
                    <div className="text-xs text-gray-400 line-through mb-0.5">
                      {product.originalPrice.toLocaleString()} P
                    </div>
                  )
                ) : (
                  <div className="text-sm mb-0.5">{product.originalPrice.toLocaleString()} P</div>
                )}
                {/* discountPrice 강조 */}
                {product.discountPrice && (
                  <div className="text-lg font-bold text-red-500 mb-0.5">
                    {product.discountPrice.toLocaleString()} P
                  </div>
                )}
                {/* 할인율 */}
                {product.discountRate && (
                  <div className="text-xs text-red-400 font-semibold mb-0.5">
                    {product.discountRate}% 할인
                  </div>
                )}
              </div>
              {/* 스크랩 버튼 */}
              <button
                className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
                disabled={scrapLoading === product.productId}
                onClick={(e) => {
                  e.stopPropagation();
                  handleScrap(product.productId, product.scraped);
                }}
              >
                {product.scraped ? (
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
      {/* 최상단 이동 버튼 */}
      {showScrollTop && (
        <button
          className="fixed z-50 bottom-24 w-12 h-12 rounded-full bg-white shadow flex items-center justify-center border border-gray-200"
          style={{
            right: windowWidth >= 768 ? 'calc(50vw - 384px + 1rem)' : '1rem',
            maxWidth: windowWidth >= 768 ? 'calc(100vw - 32px)' : undefined,
          }}
          onClick={handleScrollTop}
        >
          <svg
            width="28"
            height="28"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default Products;
