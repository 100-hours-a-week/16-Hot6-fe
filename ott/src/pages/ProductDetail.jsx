import { getConfig } from '@/config/index';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TopBar from '../components/common/TopBar';

function ProductDetail() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSheet, setShowSheet] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [carouselIdx, setCarouselIdx] = useState(0);

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
    const optionName = searchParams.get('option');
    if (optionName) {
      const found = detail.variants.find((v) => v.name === optionName);
      if (found) setSelectedVariant(found);
      else setSelectedVariant(detail.variants[0]);
    } else {
      setSelectedVariant(detail.variants[0]);
    }
  }, [detail, searchParams]);

  // variant가 바뀌면 캐러셀 인덱스 초기화
  useEffect(() => {
    setCarouselIdx(0);
  }, [selectedVariant]);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosBaseInstance.get(`/products/${productId}`);
        setDetail(res.data.data);
      } catch (err) {
        setError('상품 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [productId]);

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
      <div className="px-4 mb-4">
        {/* 태그 */}
        <div className="flex gap-1 mb-1">
          <span className="bg-gray-100 text-gray-400 text-xs px-2 py-0.5 rounded-full">특가</span>
        </div>
        {/* 상품명/남은수량 */}
        <div className="font-bold text-base mb-1">
          {detail.product_name}, {variant.name} (2개 남음)
        </div>
        {/* 가격 정보 */}
        <div className="flex items-end gap-2 mb-1">
          {discountRate && <span className="text-red-500 font-bold text-lg">{discountRate}%</span>}
          {originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {originalPrice.toLocaleString()} P
            </span>
          )}
        </div>
        <div className="text-xl font-bold mb-1">{price.toLocaleString()} P</div>

        {/* 옵션 선택 상태 표기 */}
        <div className="mb-2 text-sm text-gray-600">
          옵션 선택: <span className="font-semibold text-black">{variant?.name}</span>
        </div>

        {/* 옵션 선택 영역 */}
        <div className="mt-2 mb-4">
          <div className="font-semibold mb-2">옵션 선택</div>
          <div className="flex flex-wrap gap-2">
            {detail.variants.map((v) => (
              <button
                key={v.variant_id}
                className={`px-4 py-2 rounded-lg border text-sm transition
                  ${variant?.variant_id === v.variant_id ? 'border-blue-500 bg-blue-50 font-bold' : 'border-gray-200 bg-white'}
                `}
                onClick={() => {
                  setSelectedVariant(v);
                  setCarouselIdx(0);
                }}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* 상품 설명 */}
      <div className="px-4 mb-4">
        <div className="font-bold mb-1">상품설명</div>
        <div className="text-gray-700 whitespace-pre-line">{detail.description}</div>
      </div>
      {/* 하단 고정 바 */}
      <div
        className="fixed left-0 right-0 bottom-0 max-w-md mx-auto flex bg-white border-t z-50"
        style={{ height: '64px' }}
      >
        <button className="w-16 flex items-center justify-center" /* 스크랩 버튼 */>
          <svg width="28" height="28" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
        <button
          className="flex-1 m-3 rounded-lg bg-gray-200 text-black font-bold text-base"
          onClick={() => setShowSheet(true)}
        >
          구매하기
        </button>
      </div>
      {/* 옵션/수량 선택 바텀시트 */}
      {showSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40">
          <div className="bg-white rounded-t-2xl p-4 max-w-md mx-auto w-full animate-slideup">
            <div className="font-bold mb-2">옵션 선택</div>
            <div className="flex flex-col gap-2 mb-4">
              {detail.variants.map((v) => (
                <button
                  key={v.variant_id}
                  className={`border rounded-lg px-4 py-2 text-left ${selectedVariant?.variant_id === v.variant_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setSelectedVariant(v)}
                >
                  {v.name}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 mb-4">
              <span className="font-semibold">수량</span>
              <button
                className="w-8 h-8 rounded bg-gray-100 text-lg"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button
                className="w-8 h-8 rounded bg-gray-100 text-lg"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
            <button
              className="w-full py-3 bg-black text-white rounded-lg font-bold text-base mb-2"
              onClick={() => setShowSheet(false)}
            >
              {price.toLocaleString()} P 구매하기
            </button>
            <button className="w-full py-2 text-gray-400" onClick={() => setShowSheet(false)}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
