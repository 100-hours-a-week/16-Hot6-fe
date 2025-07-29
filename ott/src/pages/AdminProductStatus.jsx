import LoadingSpinner from '@/components/common/LoadingSpinner';
import Toast from '@/components/common/Toast';
import TopBar from '@/components/common/TopBar';
import { getConfig } from '@/config/index';
import axios from 'axios';
import { useEffect, useState } from 'react';

const { BASE_URL } = getConfig();

const axiosBaseInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
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

export default function Admin() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState('');

  // 관리자 데이터 불러오기
  const fetchAdminData = async () => {
    try {
      const response = await axiosBaseInstance.get('/admin/status');
      setAdminData(response.data.data);
      setError(null);
    } catch {
      setError('관리자 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 배송 완료 처리
  const handleDeliveryComplete = async (productOrderId) => {
    try {
      await axiosBaseInstance.patch(`/admin/orders/${productOrderId}/delivery`);
      setToast('배송 완료 처리되었습니다.');
      fetchAdminData(); // 데이터 새로고침
    } catch {
      setToast('배송 완료 처리에 실패했습니다.');
    } finally {
      setTimeout(() => setToast(''), 1500);
    }
  };

  // 환불 승인 처리
  const handleRefundApprove = async (orderItemId) => {
    try {
      await axiosBaseInstance.patch(`/admin/orders/${orderItemId}/refund/approve`);
      setToast('환불이 승인되었습니다.');
      fetchAdminData(); // 데이터 새로고침
    } catch {
      setToast('환불 승인에 실패했습니다.');
    } finally {
      setTimeout(() => setToast(''), 1500);
    }
  };

  // 환불 거부 처리
  const handleRefundReject = async (orderItemId) => {
    try {
      await axiosBaseInstance.patch(`/admin/orders/${orderItemId}/refund/reject`);
      setToast('환불이 거부되었습니다.');
      fetchAdminData(); // 데이터 새로고침
    } catch {
      setToast('환불 거부에 실패했습니다.');
    } finally {
      setTimeout(() => setToast(''), 1500);
    }
  };

  // 첫 진입 시
  useEffect(() => {
    fetchAdminData();
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
    <div className="max-w-[768px] mx-auto min-h-screen bg-white">
      <TopBar title="관리자 페이지" showBack />
      <div className="max-w-[480px] mx-auto">
        {/* 배송 대기 상품 */}
        <div className="px-4 pt-4">
          <h2 className="text-lg font-semibold mb-4">배송 대기 상품</h2>
          <div className="space-y-4">
            {adminData?.paidProductOrders?.length === 0 ? (
              <div className="text-center text-gray-400 py-8">배송 대기 상품이 없습니다.</div>
            ) : (
              adminData?.paidProductOrders?.map((order) => (
                <div
                  key={order.productOrderId}
                  className="bg-white rounded-lg p-4 border border-gray-200"
                >
                  <div className="space-y-3">
                    {order.refundedOrderItems?.map((product) => (
                      <div key={product.orderItemId} className="flex items-center space-x-4">
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{product.productName}</h3>
                          <p className="text-sm text-gray-600 mb-1">구매자: {product.userName}</p>
                          <p className="text-sm text-gray-600 mb-1">
                            수량: {product.purchaseQuantity}개
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            결제 금액: {product.paidAmount.toLocaleString()}원
                          </p>
                          <p className="text-xs text-gray-500">
                            결제일: {new Date(product.paidAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600"
                      onClick={() => handleDeliveryComplete(order.productOrderId)}
                    >
                      배송 완료
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 환불 요청 상품 */}
        <div className="px-4 pt-8">
          <h2 className="text-lg font-semibold mb-4">환불 요청 상품</h2>
          <div className="space-y-4">
            {adminData?.refundedOrderItems?.length === 0 ? (
              <div className="text-center text-gray-400 py-8">환불 요청 상품이 없습니다.</div>
            ) : (
              adminData?.refundedOrderItems?.map((product) => (
                <div
                  key={product.orderItemId}
                  className="flex items-center space-x-4 bg-white rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{product.productName}</h3>
                    <p className="text-sm text-gray-600 mb-1">구매자: {product.userName}</p>
                    <p className="text-sm text-gray-600 mb-1">수량: {product.purchaseQuantity}개</p>
                    <p className="text-sm text-gray-600 mb-1">
                      결제 금액: {product.paidAmount.toLocaleString()}원
                    </p>
                    <p className="text-sm text-gray-600 mb-1">환불 사유: {product.refundReason}</p>
                    <p className="text-xs text-gray-500">
                      환불 요청일: {new Date(product.refundedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600"
                      onClick={() => handleRefundApprove(product.orderItemId)}
                    >
                      환불 승인
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600"
                      onClick={() => handleRefundReject(product.orderItemId)}
                    >
                      환불 거부
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Toast message={toast} />
    </div>
  );
}
