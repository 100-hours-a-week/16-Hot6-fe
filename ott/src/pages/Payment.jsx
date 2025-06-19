import React from 'react';
import TopBar from '../components/common/TopBar';

// Mock 데이터 (실제 데이터는 props, location, store 등에서 받아오도록 추후 수정)
const product = {
  name: '상품 이름',
  price: 1000,
  quantity: 1,
  imageUrl: '', // 썸네일 이미지 경로
};
const availablePoint = 1500;
const orderAmount = product.price * product.quantity;
const finalAmount = orderAmount; // 포인트 차감 등 반영 시 수정

export default function Payment() {
  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white pb-24 relative">
      <TopBar title="주문/결제" showBack />
      {/* 주문 상품 정보 */}
      <div className="p-4">
        <div className="text-xl font-bold mb-4">주문상품</div>
        <div className="border rounded-xl p-4 flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>
          <div className="flex-1">
            <div className="font-bold text-base mb-1">{product.name}</div>
            <div className="text-gray-500 text-sm">
              {product.price.toLocaleString()} P | {product.quantity}개
            </div>
          </div>
        </div>
        {/* 사용 가능 포인트 */}
        <div className="border rounded-xl p-4 mb-6">
          <div className="font-bold mb-1">포인트</div>
          <div className="text-gray-700 text-sm">
            사용 가능 포인트 {availablePoint.toLocaleString()} P
          </div>
        </div>
        {/* 주문 금액/최종 결제 금액 */}
        <div className="border rounded-xl p-4 mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">주문 금액</span>
            <span className="font-bold">{orderAmount.toLocaleString()} P</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">최종 결제 금액</span>
            <span className="font-bold">{finalAmount.toLocaleString()} P</span>
          </div>
        </div>
      </div>
      {/* 하단 고정 결제하기 버튼 */}
      <div
        className="fixed max-w-[480px] w-full bottom-3 left-1/2 -translate-x-1/2 bg-white border-t z-50"
        style={{ height: '50px' }}
      >
        <button
          className="w-full h-full text-center font-bold text-lg rounded-lg bg-gray-200 text-gray-400 cursor-not-allowed"
          disabled
        >
          {finalAmount.toLocaleString()} P 결제하기
        </button>
      </div>
    </div>
  );
}
