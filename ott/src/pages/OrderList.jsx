import { getConfig } from '@/config/index';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { BASE_URL } = getConfig();
const axiosBaseInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});
axiosBaseInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
}

function formatStatus(status) {
  switch (status) {
    case 'DELIVERED':
      return '배송 완료';
    case 'PARTIALLY_REFUNDED':
      return '부분 환불 완료';
    case 'REFUNDED':
      return '환불완료';
    case 'PARTIALLY_CANCELED':
      return '부분 취소 완료';
    case 'CANCELED':
      return '취소 완료';
    case 'PAID':
      return '결제 완료';
    case 'CONFIRMED':
      return '주문 확정 완료';
    default:
      return '';
  }
}
export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosBaseInstance.get('/orders');
        setOrders(response.data.data.orders);
        setError(null);
      } catch {
        setError('주문 내역을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
      </div>
    );
  }

  if (!orders.length) {
    return <div className="text-center py-8 text-gray-500">주문 내역이 없습니다.</div>;
  }

  const paidOrders = orders.filter((order) => order.orderStatus !== 'ORDERED');

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white pb-24">
      {/* 상단 네비게이션/타이틀 */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => navigate(-1)} className="mr-2">
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-bold text-lg">주문 내역</span>
        </div>
      </div>
      {/* 주문 리스트 */}
      <div className="px-4 pt-4 space-y-6">
        {paidOrders.map((order) => {
          const products = order.products || order.product || [];
          const totalAmount = products.reduce((sum, item) => sum + item.amount * item.quantity, 0);

          return (
            <div key={order.orderId} className="border rounded-xl p-4 bg-gray-50 mb-4">
              <div className="flex flex-col mb-2">
                <span className="text-base font-bold text-gray-1000 mb-1">
                  {formatStatus(order.orderStatus)}
                </span>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{formatDate(order.orderedAt)} 주문</span>
                  <button
                    className="ml-2 px-3 py-1 bg-gray-700 text-white rounded text-xs font-semibold hover:bg-blue-600 transition"
                    onClick={() => navigate(`/orders/${order.orderId}`)}
                  >
                    주문 상세보기
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {products.map((product) => (
                  <div key={product.productId} className="flex items-center bg-white rounded p-2">
                    <img
                      src={product.imagePath}
                      alt={product.productName}
                      className="w-12 h-12 rounded mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{product.productName}</div>
                      <div className="text-xs text-gray-500">
                        {product.amount.toLocaleString()}P × {product.quantity}개
                      </div>
                    </div>
                    <div className="text-right text-sm font-semibold">
                      {(product.amount * product.quantity).toLocaleString()}P
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-2">
                <span className="text-base font-bold text-gray-1000">
                  총 결제금액: {totalAmount.toLocaleString()}P
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
