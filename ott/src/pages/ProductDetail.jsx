import axiosInstance from '@/api/axios';
import { addScrap, removeScrap } from '@/api/scraps';
import { getConfig } from '@/config/index';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';
import TopBar from '../components/common/TopBar';

function ProductDetail() {
  const navigate = useNavigate();
  const { productId, variantId } = useParams();
  const [searchParams] = useSearchParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSheet, setShowSheet] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [toast, setToast] = useState('');
  const [scrapLoading, setScrapLoading] = useState(false);
  const [orderVariant, setOrderVariant] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [orderOptions, setOrderOptions] = useState([]); // [{variant, quantity}]

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

  // 옵션 쿼리파라미터로 자동 선택
  useEffect(() => {
    if (!detail) return;
    // 1. URL에 variantId가 있으면 우선적으로 해당 옵션 선택
    if (variantId) {
      const found = detail.variants.find((v) => String(v.variant_id) === String(variantId));
      if (found) {
        setSelectedVariant(found);
        return;
      }
    }
    // 2. option 쿼리파라미터가 있으면 해당 옵션 선택
    const optionName = searchParams.get('option');
    if (optionName) {
      const found = detail.variants.find((v) => v.name === optionName);
      if (found) {
        setSelectedVariant(found);
        return;
      }
    }
    // 3. 기본값: 첫 번째 옵션
    setSelectedVariant(detail.variants[0]);
  }, [detail, searchParams, variantId]);

  // variant가 바뀌면 캐러셀 인덱스 초기화
  useEffect(() => {
    setCarouselIdx(0);
  }, [selectedVariant]);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosBaseInstance.get(`/products/${variantId}`);
        setDetail(res.data.data);

        // variant 자동 선택
        const found = res.data.data.variants.find(
          (v) => String(v.variant_id) === String(variantId),
        );
        setSelectedVariant(found || res.data.data.variants[0]);
      } catch (err) {
        setError('상품 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [variantId]);

  // 스크랩 토글 핸들러
  const handleScrap = async () => {
    if (!selectedVariant) return;
    setScrapLoading(true);
    try {
      if (selectedVariant.scraped) {
        await removeScrap({ type: 'SERVICE_PRODUCT', targetId: selectedVariant.variant_id });
        setDetail((prev) => ({
          ...prev,
          variants: prev.variants.map((v) =>
            v.variant_id === selectedVariant.variant_id ? { ...v, scraped: false } : v,
          ),
        }));
        setSelectedVariant((prev) => ({ ...prev, scraped: false }));
        setToast('스크랩이 취소되었어요.');
      } else {
        await addScrap({ type: 'SERVICE_PRODUCT', targetId: selectedVariant.variant_id });
        setDetail((prev) => ({
          ...prev,
          variants: prev.variants.map((v) =>
            v.variant_id === selectedVariant.variant_id ? { ...v, scraped: true } : v,
          ),
        }));
        setSelectedVariant((prev) => ({ ...prev, scraped: true }));
        setToast('스크랩이 추가되었어요.');
      }
    } catch (err) {
      if (err.response?.status === 401) return;
      setToast('전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setTimeout(() => setToast(''), 1500);
      setScrapLoading(false);
    }
  };

  // 바텀시트 내 구매하기 버튼 핸들러
  const handleOrder = async () => {
    if (orderOptions.length === 0) return;

    const orderItems = orderOptions.map(({ variant, quantity }) => {
      return {
        variantId: variant.variant_id,
        quantity,
      };
    });

    try {
      const res = await axiosInstance.post('/orders', { products: orderItems });
      navigate(`/payment/${res.data.data.orderId}`);
    } catch (err) {
      // 실패 처리 (예: 토스트 등)
      if (err.response?.status === 403) {
        setToast('추천인 코드를 입력 후 이용할 수 있습니다.');
        setTimeout(() => {
          setToast('');
          navigate('/my-page');
        }, 1500);
        return;
      }
      setToast(`주문에 실패했습니다. 잠시 후 다시 시도해주세요.`);
      setTimeout(() => setToast(''), 1500);
    }
  };

  // 바텀시트 내 옵션 추가
  const handleSelectOption = (variant) => {
    if (orderOptions.some((o) => o.variant.variant_id === variant.variant_id)) {
      setToast('이미 선택한 옵션입니다.');
      setTimeout(() => setToast(''), 1500);
      return;
    }
    setOrderOptions((prev) => [...prev, { variant, quantity: 1 }]);
    setOrderVariant(null);
    setShowOptions(false);
  };

  // 수량 변경
  const handleChangeQty = (variantId, delta) => {
    setOrderOptions((prev) =>
      prev.map((o) =>
        o.variant.variant_id === variantId
          ? { ...o, quantity: Math.max(1, o.quantity + delta) }
          : o,
      ),
    );
  };

  // 옵션 삭제
  const handleRemoveOption = (variantId) => {
    setOrderOptions((prev) => prev.filter((o) => o.variant.variant_id !== variantId));
  };

  // 총 수량/금액 계산
  const totalCount = orderOptions.reduce((sum, o) => sum + o.quantity, 0);
  const totalPrice = orderOptions.reduce(
    (sum, o) => sum + (o.variant.promotions?.[0]?.discount_price || o.variant.price) * o.quantity,
    0,
  );

  // 품절 상태 확인
  const isOutOfStock = () => {
    if (!selectedVariant) return false;
    const hasPromo = !!selectedVariant.promotions?.[0];
    if (hasPromo) {
      // 특가 상품: 프로모션 status가 SOLD_OUT이면 품절
      return selectedVariant.promotions[0].status === 'SOLD_OUT';
    } else {
      // 일반 상품: status가 OUT_OF_STOCK이면 품절
      return selectedVariant.status === 'OUT_OF_STOCK';
    }
  };

  // 안내용 느낌표 SVG
  const ExclamationIcon = () => (
    <svg
      className="w-5 h-5 text-yellow-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );

  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>
    );
  }
  if (!detail) return null;

  const variant = selectedVariant || detail.variants[0];
  const images = variant.image_urls || [];
  const promo = variant.promotions[0];
  const hasPromo = !!promo;
  const price = hasPromo ? promo.discount_price : variant.price;
  const originalPrice = variant.price;
  const discountRate = hasPromo ? promo.rate : null;
  const available = hasPromo ? promo.available_quantity : variant.available_quantity;
  const maxPerCustomer = variant.promotions?.[0]?.max_per_customer;

  // TopBar title 동적 변경
  const topBarTitle = `${detail.product_name}${variant && variant.name ? ', ' + variant.name : ''}`;

  return (
    <div className="max-w-[768px] mx-auto min-h-screen bg-white pb-24 relative">
      {/* 배경 오버레이 (640px 이상일 때 회색 배경) */}
      <div className="fixed inset-0 bg-gray-100 -z-10 hidden sm:block" />
      <TopBar title={topBarTitle} showBack />

      {/* 상품 이미지 캐러셀 */}
      <div className="relative flex flex-col items-center mb-4 px-4 mt-6">
        <div className="relative flex items-center justify-center w-[360px] h-[360px] rounded-xl overflow-hidden">
          {/* 순서/전체 표기 */}
          {images.length > 1 && (
            <div className="absolute bottom-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
              {carouselIdx + 1} / {images.length}
            </div>
          )}
          {/* 메인 이미지 */}
          {images[carouselIdx] && (
            <img
              src={images[carouselIdx]}
              alt={`이미지 ${carouselIdx + 1}`}
              className="object-contain w-full h-full"
            />
          )}
        </div>
        {/* 썸네일 리스트 */}
        <div className="flex gap-2 mt-2">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`썸네일 ${idx + 1}`}
              className={`w-12 h-12 object-cover rounded cursor-pointer ${idx === carouselIdx ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setCarouselIdx(idx)}
            />
          ))}
        </div>
      </div>
      {/* 상품 정보 박스 */}
      <div className="px-4 mb-4 border-b-4 pb-4">
        {/* 태그 */}
        {hasPromo && (
          <div className="flex gap-1 mb-1">
            <span className="bg-gray-100 text-gray-400 text-xs px-2 py-0.5 rounded-full">특가</span>
          </div>
        )}
        {/* 상품명/남은수량 */}
        <div className="text-lg mb-1">
          {detail.product_name}, {variant.name}
        </div>
        {/* 가격 정보 */}
        <div className="flex items-center gap-2 mb-1">
          {discountRate && <span className="text-red-500 font-bold text-lg">{discountRate}%</span>}
          {hasPromo && (
            <span className="text-sm text-gray-400 line-through">
              {originalPrice.toLocaleString()} P
            </span>
          )}
        </div>
        <div className="text-xl font-bold mb-1">{price.toLocaleString()} P</div>
      </div>

      {/* 옵션 선택 영역 */}
      <div className="px-4 mb-4 border-b-4 pb-4">
        {/* 옵션 선택 상태 표기 */}
        <div className="mb-2 text-sm text-gray-600">
          옵션 선택: <span className="font-semibold text-black">{variant?.name}</span>
        </div>
        <div className="font-semibold mb-2">옵션 선택</div>
        <div className="flex flex-wrap gap-2 mb-2">
          {detail.variants.map((v) => {
            // 품절 상태 확인
            const hasPromo = !!v.promotions?.[0];
            let isVariantOutOfStock = false;
            let isOpenSoon = false;
            let openSoonDateText = '';
            if (hasPromo) {
              const promo = v.promotions[0];
              const now = new Date();
              const startAt = new Date(promo.start_at);
              if (now < startAt) {
                // 오픈예정
                const month = String(startAt.getMonth() + 1).padStart(2, '0');
                const day = String(startAt.getDate()).padStart(2, '0');
                const hour = String(startAt.getHours()).padStart(2, '0');
                isOpenSoon = true;
                openSoonDateText = `${month}/${day} ${hour}시 오픈예정`;
                isVariantOutOfStock = true;
              } else {
                isVariantOutOfStock = promo.status === 'SOLD_OUT';
              }
            } else {
              isVariantOutOfStock = v.status === 'OUT_OF_STOCK';
            }

            return (
              <button
                key={v.variant_id}
                className={`px-4 py-2 rounded-lg border text-sm transition flex items-center gap-2 ${
                  isVariantOutOfStock
                    ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : variant?.variant_id === v.variant_id
                      ? 'border-blue-500 bg-blue-50 font-bold'
                      : 'border-gray-200 bg-white'
                }`}
                onClick={() => {
                  if (!isVariantOutOfStock) {
                    setSelectedVariant(v);
                    setCarouselIdx(0);
                  }
                }}
                disabled={isVariantOutOfStock}
              >
                <span>
                  {v.name}
                  {!isOpenSoon && isVariantOutOfStock ? ' (품절)' : ''}
                </span>
              </button>
            );
          })}
        </div>
        {/* 특가 상품 한정수량 안내 */}
        {variant?.promotions?.[0]?.max_per_customer && (
          <div className="flex items-center gap-2 mt-3 mb-2 px-2 py-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <ExclamationIcon />
            <span className="font-semibold text-gray-700">한정수량</span>
            <span className="text-gray-500">
              | 1인당 {variant.promotions[0].max_per_customer}개까지 구매할 수 있습니다
            </span>
          </div>
        )}
      </div>

      {/* 상품정보 섹션 */}
      {detail.specification && (
        <div className="px-4 mb-4 border-b-4 pb-4">
          <div className="text-xl font-bold mb-2">상품정보</div>
          <div className="text-sm text-gray-800">
            {Object.entries(detail.specification).map(([key, value]) => (
              <div
                key={key}
                className="flex flex-col sm:flex-row justify-between py-1 last:border-b-0 min-w-0"
              >
                <span className="text-gray-500 sm:w-1/6">{key}</span>
                <span className="font-medium break-words whitespace-normal flex-1 min-w-0 sm:w-5/6">
                  {typeof value === 'object' && value !== null
                    ? Object.entries(value)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')
                    : value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 상품 설명 */}
      <div className="px-4 mb-4 border-b-4 pb-4">
        <div className="text-xl font-bold mb-2">상세정보</div>
        <div className="prose text-gray-700">
          <ReactMarkdown>{detail.description}</ReactMarkdown>
        </div>
      </div>

      {/* 배송/환불 */}
      <div className="px-4 mb-4">
        <div className="text-xl font-bold mb-4">배송/환불</div>
        <div className="bg-white rounded-lg text-gray-800">
          <div className="mb-8">
            <h2 className="font-bold text-base mb-1">배송 안내</h2>
            <p className="mb-4 text-sm">
              상품은 주문 후 1일 이내(영업일 기준) 배송됩니다. [예정시간:13-14시]
            </p>
          </div>

          {/* 반품 사유에 따른 요청 가능 기간 */}
          <div className="mb-8">
            <h2 className="font-bold text-base mb-1">반품 사유에 따른 요청 가능 기간</h2>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>구매자 단순 변심은 상품 수령 후 2일 이내</li>
              <li>
                표시/광고와 상이, 계약내용과 다르게 이행된 경우 상품 수령 후 2일 이내 경과 시
                반품/교환 불가
              </li>
            </ol>
          </div>

          {/* 반품 불가능 사유 */}
          <div>
            <h2 className="font-bold text-base mb-1">반품 불가능 사유</h2>
            <p className="text-gray-500 mb-4 text-sm">아래와 같은 경우 반품이 불가능합니다.</p>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>반품요청기간이 지난 경우</li>
              <li>
                구매자의 책임 있는 사유로 상품 등이 멸실 또는 훼손된 경우
                <span className="text-gray-500">
                  {' '}
                  (단, 상품의 내용을 확인하기 위하여 포장 등을 훼손한 경우는 제외)
                </span>
              </li>
              <li>
                포장을 개봉하였으나 포장이 훼손되어 상품가치가 현저히 상실된 경우
                <span className="text-gray-500"> (예: 식품, 화장품)</span>
              </li>
              <li>
                구매자의 사용 또는 일부 소비에 의하여 상품의 가치가 현저히 감소한 경우
                <span className="text-gray-500">
                  {' '}
                  (라벨이 떨어진 의류 또는 태그가 떨어진 명품관 상품인 경우)
                </span>
              </li>
              <li>
                시간의 경과에 의하여 재판매가 곤란할 정도로 상품 등의 가치가 현저히 감소한 경우
                <span className="text-gray-500"> (예: 식품, 화장품)</span>
              </li>
              <li>고객주문 확인 후 상품제작에 들어가는 주문제작상품</li>
              <li>
                복제가 가능한 상품 등의 포장을 훼손한 경우
                <span className="text-gray-500"> (CD/DVD/GAME/도서의 경우 포장 개봉 시)</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* 하단 고정 바 */}
      <div
        className="fixed max-w-[768px] w-full bottom-0 left-1/2 -translate-x-1/2 bg-white border-t z-40"
        style={{ height: '64px' }}
      >
        <div className="mx-auto flex w-full max-w-[640px] h-full">
          <button
            className="w-16 flex items-center justify-center"
            disabled={scrapLoading}
            onClick={handleScrap}
          >
            {selectedVariant?.scraped ? (
              <svg
                width="28"
                height="28"
                fill="#2563eb"
                stroke="#2563eb"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            ) : (
              <svg
                width="28"
                height="28"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>
          {/* 구매 버튼 오픈예정 처리 */}
          {(() => {
            let isOpenSoon = false;
            let openSoonDateText = '';
            if (selectedVariant && selectedVariant.promotions?.[0]) {
              const promo = selectedVariant.promotions[0];
              const now = new Date();
              const startAt = new Date(promo.start_at);
              if (now < startAt) {
                isOpenSoon = true;
                const month = String(startAt.getMonth() + 1).padStart(2, '0');
                const day = String(startAt.getDate()).padStart(2, '0');
                const hour = String(startAt.getHours()).padStart(2, '0');
                openSoonDateText = `${month}/${day} ${hour}시 오픈예정`;
              }
            }
            return (
              <button
                className={`flex-1 m-3 rounded-lg font-bold text-base bg-gray-300 text-gray-400 cursor-not-allowed`}
                style={{ display: isOpenSoon ? undefined : 'none' }}
                disabled
              >
                {openSoonDateText}
              </button>
            );
          })()}
          <button
            className={`flex-1 m-3 rounded-lg font-bold text-base ${
              isOutOfStock()
                ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white'
            }`}
            onClick={() => setShowSheet(true)}
            disabled={
              isOutOfStock() ||
              (selectedVariant &&
                selectedVariant.promotions?.[0] &&
                new Date() < new Date(selectedVariant.promotions[0].start_at))
            }
            style={{
              display:
                selectedVariant &&
                selectedVariant.promotions?.[0] &&
                new Date() < new Date(selectedVariant.promotions[0].start_at)
                  ? 'none'
                  : undefined,
            }}
          >
            {isOutOfStock() ? '품절' : '구매하기'}
          </button>
        </div>
        <Toast message={toast} />
      </div>
      {/* 옵션/수량 선택 바텀시트 */}
      {showSheet && (
        <div
          className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40"
          onClick={() => setShowSheet(false)}
        >
          <div
            className="bg-white rounded-t-2xl p-4 max-w-[768px] mx-auto w-full animate-slideup relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 우측 상단 닫기 버튼 */}
            <button
              className="absolute top-2 right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700"
              onClick={() => setShowSheet(false)}
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
            <div className="font-bold mb-2 flex items-center gap-1">
              옵션선택(필수)
              <span className="text-red-500">*</span>
            </div>
            {/* 셀렉트 스타일 옵션 선택 */}
            <div className="mb-4">
              <div className="border rounded-lg overflow-hidden">
                <button
                  className="w-full flex justify-between items-center px-4 py-3 text-base font-medium bg-gray-50 hover:bg-gray-100 focus:outline-none"
                  onClick={() => setShowOptions((prev) => !prev)}
                  type="button"
                >
                  {orderVariant ? orderVariant.name : '옵션을 선택하세요'}
                  <svg
                    className={`w-5 h-5 ml-2 transition-transform ${showOptions ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="#222"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showOptions && (
                  <div className="bg-white border-t divide-y max-h-60 overflow-y-auto">
                    {detail.variants.map((v) => {
                      const isSelected = orderOptions.some(
                        (o) => o.variant.variant_id === v.variant_id,
                      );

                      // 품절 상태 확인
                      const hasPromo = !!v.promotions?.[0];
                      let isVariantOutOfStock = false;
                      let isOpenSoon = false;
                      let openSoonDateText = '';
                      if (hasPromo) {
                        const promo = v.promotions[0];
                        const now = new Date();
                        const startAt = new Date(promo.start_at);
                        if (now < startAt) {
                          // 오픈예정
                          const month = String(startAt.getMonth() + 1).padStart(2, '0');
                          const day = String(startAt.getDate()).padStart(2, '0');
                          const hour = String(startAt.getHours()).padStart(2, '0');
                          isOpenSoon = true;
                          openSoonDateText = `${month}/${day} ${hour}시 오픈예정`;
                          isVariantOutOfStock = true;
                        } else {
                          isVariantOutOfStock = promo.status === 'SOLD_OUT';
                        }
                      } else {
                        isVariantOutOfStock = v.status === 'OUT_OF_STOCK';
                      }

                      return (
                        <button
                          key={v.variant_id}
                          className={`w-full text-left px-4 py-3 flex items-center justify-between ${
                            isVariantOutOfStock
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : orderVariant?.variant_id === v.variant_id
                                ? 'bg-blue-50 font-bold text-blue-600 hover:bg-blue-50'
                                : 'hover:bg-blue-50'
                          }`}
                          onClick={() => !isVariantOutOfStock && handleSelectOption(v)}
                          type="button"
                          disabled={isVariantOutOfStock}
                        >
                          <span>
                            {v.name}
                            {!isOpenSoon && isVariantOutOfStock ? ' (품절)' : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            {/* 선택된 옵션 목록 */}
            {orderOptions.length > 0 && (
              <div className="mb-4 border rounded-lg divide-y">
                {orderOptions.map(({ variant, quantity }) => {
                  const price = variant.promotions?.[0]?.discount_price || variant.price;
                  const maxPerCustomer = variant.promotions?.[0]?.max_per_customer;
                  return (
                    <div
                      key={variant.variant_id}
                      className="flex items-center px-4 py-3 justify-between"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-base mb-1 flex items-center gap-2">
                          {variant.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="w-8 h-8 rounded bg-gray-100 text-lg flex items-center justify-center border border-gray-200"
                            onClick={() => handleChangeQty(variant.variant_id, -1)}
                            disabled={quantity <= 1}
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold">{quantity}</span>
                          <button
                            className={`w-8 h-8 rounded text-lg flex items-center justify-center border border-gray-200 transition
                              ${maxPerCustomer && quantity >= maxPerCustomer ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
                            onClick={() => {
                              if (maxPerCustomer) {
                                if (quantity >= maxPerCustomer) {
                                  setToast(`1인당 ${maxPerCustomer}개까지 구매할 수 있습니다`);
                                  setTimeout(() => setToast(''), 1500);
                                  return;
                                }
                                if (quantity === maxPerCustomer - 1) {
                                  setToast(`1인당 ${maxPerCustomer}개까지 구매할 수 있습니다`);
                                  setTimeout(() => setToast(''), 1500);
                                }
                              }
                              handleChangeQty(variant.variant_id, 1);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-4">
                        <button
                          className="w-6 h-6 flex items-center justify-center mb-1 text-gray-400 hover:text-gray-700"
                          onClick={() => handleRemoveOption(variant.variant_id)}
                        >
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M6 6l12 12M6 18L18 6" />
                          </svg>
                        </button>
                        <div className="text-lg font-bold text-gray-900">
                          {(price * quantity).toLocaleString()} P
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* 총 수량/금액 */}
            <div className="flex justify-between items-center px-2 py-3 border-t font-bold text-base">
              <span>
                총 수량 <span className="text-blue-600">{totalCount}개</span>
              </span>
              <span>
                총 금액 <span className="text-red-500">{totalPrice.toLocaleString()} P</span>
              </span>
            </div>
            {/* 수량 선택 등 추가 UI 필요시 여기에 */}
            <button
              className={`w-full py-3 rounded-lg font-bold text-base mt-2 ${orderOptions.length > 0 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-400 cursor-not-allowed'}`}
              disabled={orderOptions.length === 0}
              onClick={handleOrder}
            >
              {orderOptions.length > 0 ? '구매하기' : '옵션을 먼저 선택해주세요.'}
            </button>
            <Toast message={toast} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
