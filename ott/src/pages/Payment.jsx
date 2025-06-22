import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axios';

import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';
import TopBar from '../components/common/TopBar';

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(`/orders/${orderId}`);
        setOrderData(res.data.data);
      } catch (err) {
        setError('주문 정보를 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handlePayment = async () => {
    setIsPaying(true);
    setToast('');
    try {
      await axiosInstance.post(`/orders/${orderId}/payments`, { point: payment.paymentAmount });
      navigate(`/payment/${orderId}/complete`);
    } catch (err) {
      const errorMessage = err.response?.data?.message;
      setToast(errorMessage);
      if (err.response.status === 400 || err.response.status === 404) {
        setTimeout(() => {
          navigate('/products');
        }, 2000);
      } else if (err.response.status === 403) {
        setTimeout(() => {
          setToast('');
          navigate('/');
        }, 2000);
      } else {
        setTimeout(() => setToast(''), 2000);
      }
      console.error(err);
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !orderData) {
    return (
      <div className="max-w-[768px] mx-auto min-h-screen bg-white flex items-center justify-center">
        <div className="fixed inset-0 bg-gray-100 -z-10 hidden sm:block" />
        <p className="text-red-500">{error || '주문 정보를 찾을 수 없습니다.'}</p>
      </div>
    );
  }

  const { products, payment } = orderData;

  return (
    <div className="max-w-[768px] mx-auto min-h-screen bg-white pb-24 relative">
      <div className="fixed inset-0 bg-gray-100 -z-10 hidden sm:block" />
      <TopBar title="주문/결제" showBack />
      <div className="max-w-[480px] mx-auto p-4">
        {/* 주문 상품 정보 */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4">주문상품</h2>
          <div className="border rounded-xl divide-y">
            {products.map((product) => (
              <div key={product.id} className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                  {product.imagePath ? (
                    <img
                      src={product.imagePath}
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
            ))}
          </div>
        </div>

        {/* 주문 금액/최종 결제 금액 */}
        <div className="border rounded-xl p-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">주문 금액</span>
            <span className="font-bold">{payment.originalAmount.toLocaleString()} P</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">할인 금액</span>
            <span className="font-bold text-red-500">
              - {payment.discountAmount.toLocaleString()} P
            </span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>최종 결제 금액</span>
            <span>{payment.paymentAmount.toLocaleString()} P</span>
          </div>
        </div>
      </div>

      {/* 하단 고정 결제하기 버튼 */}
      <div className="fixed max-w-[480px] w-full bottom-0 left-1/2 -translate-x-1/2 bg-white p-3 border-t z-50">
        <button
          className="w-full h-full py-3 text-center font-bold text-lg rounded-lg bg-blue-500 text-white disabled:bg-gray-300"
          onClick={handlePayment}
          disabled={isPaying}
        >
          {isPaying ? '결제 진행 중...' : `${payment.paymentAmount.toLocaleString()} P 결제하기`}
        </button>
      </div>
      <Toast message={toast} />
    </div>
  );
}
