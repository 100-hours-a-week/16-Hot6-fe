import SimpleModal from '@/components/common/SimpleModal';
import TopBar from '@/components/common/TopBar';
import { getConfig } from '@/config/index';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
    return Promise.reject(error);
  },
);

// 주문 상태에 따라 주문 정보(결제 완료 등) 표시 여부를 결정하는 함수
function shouldShowOrderInfo(status) {
  // PENDING, CANCELED, REFUNDED가 아니면 true
  return !['PENDING', 'CANCELED', 'REFUNDED'].includes(status);
}

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [toast, setToast] = useState('');
  const [forbiddenModal, setForbiddenModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showRefundErrorToast, setShowRefundErrorToast] = useState(false);
  const [selectedRefundReason, setSelectedRefundReason] = useState('');
  const [selectedCancelReason, setSelectedCancelReason] = useState('');

  // 선택 가능한 상품 id 목록 계산
  const canSelectProductIds = useMemo(() => {
    if (!orderData) return [];
    return orderData.products
      .filter((item) => {
        if (orderData.order.status === 'PAID' || orderData.order.status === 'PARTIALLY_CANCELED')
          return item.status === 'PAID';
        if (
          orderData.order.status === 'DELIVERED' ||
          orderData.order.status === 'PARTIALLY_REFUNDED'
        )
          return item.status === 'DELIVERED';
        return false;
      })
      .map((item) => item.id);
  }, [orderData]);

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}. ${month}. ${day} ${hour}시 ${minute}분`;
  }

  // 상품 상태에 따른 텍스트 반환
  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return '결제대기';
      case 'DELIVERED':
        return '배송완료';
      case 'REFUND_REQUEST':
        return '환불요청';
      case 'REFUND_APPROVED':
        return '환불완료';
      case 'REFUND_REJECTED':
        return '환불거절';
      case 'CANCELED':
        return '취소완료';
      case 'PAID':
        return '결제완료';
      case 'CONFIRMED':
        return '주문확정완료';
      default:
        return '';
    }
  };

  // 상품 상태에 따른 텍스트 색상 반환
  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-gray-500';
      case 'REFUND_APPROVED':
        return 'bg-red-500';
      case 'CANCELED':
        return 'bg-gray-500';
      case 'PAID':
        return 'bg-gray-500';
      case 'CONFIRMED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // 주문 상세 데이터 불러오기
  const fetchOrderData = async () => {
    try {
      const response = await axiosBaseInstance.get(`/orders/${orderId}`);
      setOrderData(response.data.data);
      setError(null);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setForbiddenModal(true);
        return;
      }
      console.error('주문 정보 조회 실패:', error);
      setError('주문 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 체크박스 핸들러
  const handleProductCheck = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  };

  // 전체 선택 체크박스 핸들러
  const handleAllCheck = () => {
    if (allChecked) {
      setSelectedProducts([]);
      setAllChecked(false);
    } else {
      setSelectedProducts(canSelectProductIds);
      setAllChecked(true);
    }
  };

  // 상품 체크박스 클릭 시 전체 선택 상태 동기화
  useEffect(() => {
    setAllChecked(
      canSelectProductIds.length > 0 &&
        canSelectProductIds.every((id) => selectedProducts.includes(id)),
    );
  }, [selectedProducts, canSelectProductIds]);

  // 주문 전체 확정 API
  const handleConfirmAll = async () => {
    try {
      await axiosBaseInstance.patch(`/orders/${orderId}/confirm`);
      setToast('전체 상품이 확정되었습니다.');
      fetchOrderData();
    } catch {
      setToast('주문 확정에 실패했습니다.');
    }
  };

  // 환불 처리
  const handleRefund = async () => {
    if (!selectedRefundReason) {
      setToast('환불 사유를 선택해주세요.');
      return;
    }

    try {
      await axiosBaseInstance.patch(`/orders/${orderId}/refund/request`, {
        orderItemIds: selectedProducts,
        refundReason: selectedRefundReason,
      });
      setToast('환불 요청이 완료되었습니다.');
      setShowRefundModal(false);
      setSelectedRefundReason('');
      navigate('/orders');
    } catch {
      setShowRefundErrorToast(true);
      setTimeout(() => setShowRefundErrorToast(false), 3000);
    }
  };

  // 주문 취소/환불 버튼 핸들러
  const handleCancelOrRefund = () => {
    const status = orderData.order.status;
    if (status === 'PAID' || status === 'PARTIALLY_CANCELED') {
      setShowActionModal(true);
    } else {
      setShowRefundModal(true);
    }
  };

  // 주문 취소 API 호출
  const handleCancelConfirm = async () => {
    if (!selectedCancelReason) {
      setToast('취소 사유를 선택해주세요.');
      return;
    }

    try {
      const allSelected =
        canSelectProductIds.length > 0 && selectedProducts.length === canSelectProductIds.length;
      if (allSelected) {
        // 전체 취소
        await axiosBaseInstance.patch(`/orders/${orderId}/cancel`, {
          cancelReason: selectedCancelReason,
        });
      } else {
        // 부분 취소
        await axiosBaseInstance.patch(`/orders/${orderId}/partially-cancel`, {
          orderItemIds: selectedProducts,
          cancelReason: selectedCancelReason,
        });
      }
      setToast('주문이 취소되었습니다.');
      setShowActionModal(false);
      setSelectedCancelReason('');
      navigate('/orders');
    } catch {
      setToast('주문 취소에 실패했습니다.');
      setShowActionModal(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate('/orders')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  if (!orderData) return null;

  // 버튼 활성화 조건
  const isButtonEnabled =
    canSelectProductIds.length > 0 &&
    selectedProducts.filter((id) => canSelectProductIds.includes(id)).length > 0;

  return (
    <div className="max-w-[768px] mx-auto min-h-screen bg-white">
      <TopBar title="주문 상세내역" showBack />
      <div className="max-w-[480px] mx-auto">
        {/* 주문 일시/번호 (결제완료 시) */}
        {shouldShowOrderInfo(orderData.order.status) && (
          <div className="px-4 pt-0 pb-6">
            <h3 className="text-lg font-semibold mb-2">결제 완료</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm">
                <span className="text-gray-500">주문 번호:</span> {orderData.order.orderNumber}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">주문 일시:</span>{' '}
                {formatDate(orderData.order.orderedAt)}
              </p>
            </div>
          </div>
        )}

        <div className="px-4 pt-0">
          <h3 className="text-lg font-semibold mb-4">주문자 정보</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm">
              <span className="text-gray-500">닉네임:</span> {orderData.user.nicknameKakao}
            </p>
            <p className="text-sm mt-1">
              <span className="text-gray-500">이메일:</span> {orderData.user.email}
            </p>
          </div>
        </div>

        <div className="px-4 pt-6">
          <h3 className="text-lg font-semibold mb-4">주문상품</h3>
          {/* 전체 주문 확정 버튼 (DELIVERED, PARTIALLY_REFUNDED 상태 & DELIVERED 상품 존재 시) */}
          {(orderData.order.status === 'DELIVERED' ||
            orderData.order.status === 'PARTIALLY_REFUNDED') &&
            orderData.products.some((item) => item.status === 'DELIVERED') && (
              <button
                className="mb-4 w-full py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
                onClick={handleConfirmAll}
              >
                주문 확정
              </button>
            )}
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              className="mr-2"
              checked={allChecked}
              onChange={handleAllCheck}
              disabled={canSelectProductIds.length === 0}
            />
            <span className="text-sm">전체 선택</span>
          </div>
          <div className="space-y-4">
            {orderData.products.map((item) => {
              const productKey = item.id;
              // 주문 취소 체크박스 조건
              const canCancel =
                (orderData.order.status === 'PAID' ||
                  orderData.order.status === 'PARTIALLY_CANCELED') &&
                item.status === 'PAID';
              // 환불 체크박스 조건
              const canRefund =
                (orderData.order.status === 'DELIVERED' ||
                  orderData.order.status === 'PARTIALLY_REFUNDED') &&
                item.status === 'DELIVERED';
              // 체크박스 비활성화 조건 - 현재 상품의 상태만 확인
              const isCheckboxDisabled = [
                'REFUND_REQUEST',
                'REFUND_APPROVED',
                'REFUND_REJECTED',
                'CANCELED',
                'CONFIRMED',
              ].includes(item.status);
              // 체크박스 표시 조건
              const showCheckbox = canCancel || canRefund || isCheckboxDisabled;

              return (
                <div key={productKey} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  {showCheckbox && (
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedProducts.includes(productKey)}
                      onChange={() => handleProductCheck(productKey)}
                      disabled={isCheckboxDisabled}
                    />
                  )}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img
                      src={item.imagePath}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute top-0 left-0 right-0 ${getStatusColor(item.status)} text-white text-xs py-1 px-2 text-center`}
                    >
                      {getStatusText(item.status)}
                    </div>
                  </div>
                  <div className="flex-1 ml-4">
                    <p className="font-medium">
                      {item.name}
                      {item.status === 'CONFIRMED' && (
                        <span className="ml-2 text-xs text-blue-600">(주문 확정)</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.price.toLocaleString()} P × {item.quantity}개
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(item.price * item.quantity).toLocaleString()} P</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-4 pt-6 pb-6">
          <h3 className="text-lg font-semibold mb-4">결제 정보</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">결제 수단</span>
              <span>{orderData.payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">총 상품 금액</span>
              <span>{orderData.payment.originalAmount.toLocaleString()} P</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">할인 금액</span>
              <span className="text-red-500">
                -{orderData.payment.discountAmount.toLocaleString()} P
              </span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">총 결제 금액</span>
                <span className="text-xl font-bold">
                  {orderData.payment.paymentAmount.toLocaleString()} P
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 환불 정보 표시 */}
        {orderData.products.some(
          (product) => product.status === 'CANCELED' || product.status === 'REFUNDED',
        ) &&
          orderData.refund && (
            <div className="px-4 pt-0 pb-6">
              <h3 className="font-semibold mb-4">환불 정보</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">환불 수단</span>
                  <span>{orderData.refund.refundMethod}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">환불 금액</span>
                  <span className="text-blue-600 font-bold">
                    {orderData.refund.refundAmount.toLocaleString()} P
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* 주문 취소/환불 버튼 */}
        {(orderData.order.status === 'PAID' ||
          orderData.order.status === 'PARTIALLY_CANCELED' ||
          orderData.order.status === 'PARTIALLY_REFUNDED' ||
          orderData.order.status === 'DELIVERED') && (
          <div
            className="fixed max-w-[768px] w-full bottom-0 left-1/2 -translate-x-1/2 bg-white border-t z-50"
            style={{ height: '64px' }}
          >
            <div className="mx-auto flex w-full max-w-[480px] h-full">
              <button
                className="flex-1 m-3 py-3 bg-gray-700 text-white rounded text-sm font-semibold hover:bg-gray-300
    disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                onClick={handleCancelOrRefund}
                disabled={!isButtonEnabled}
              >
                {orderData.order.status === 'PAID' ||
                orderData.order.status === 'PARTIALLY_CANCELED'
                  ? '주문 취소'
                  : '환불하기'}
              </button>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg">
            {toast}
          </div>
        )}

        {/* 주문 취소 확인 모달 */}
        <SimpleModal
          open={showActionModal}
          onClose={() => {
            setShowActionModal(false);
            setSelectedCancelReason('');
          }}
          message={
            <div className="space-y-4">
              <p className="text-center mb-4">취소 사유를 선택해주세요</p>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cancelReason"
                    value="CHANGE_COLOR"
                    checked={selectedCancelReason === 'CHANGE_COLOR'}
                    onChange={(e) => setSelectedCancelReason(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">다른 색상 구매</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cancelReason"
                    value="WRONG_ORDER"
                    checked={selectedCancelReason === 'WRONG_ORDER'}
                    onChange={(e) => setSelectedCancelReason(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">주문 실수</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cancelReason"
                    value="CHANGE_MIND"
                    checked={selectedCancelReason === 'CHANGE_MIND'}
                    onChange={(e) => setSelectedCancelReason(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">단순 변심</span>
                </label>
              </div>
            </div>
          }
          onRightClick={handleCancelConfirm}
          rightButtonText="취소하기"
          showCancel={true}
        />

        {forbiddenModal && (
          <SimpleModal
            open={forbiddenModal}
            message="카테부 인증 회원만 이용 가능합니다."
            onClose={() => {
              setForbiddenModal(false);
              navigate(-1);
            }}
            rightButtonText="확인"
            onRightClick={() => {
              setForbiddenModal(false);
              navigate(-1);
            }}
          />
        )}

        {/* 환불 사유 선택 모달 */}
        <SimpleModal
          open={showRefundModal}
          onClose={() => {
            setShowRefundModal(false);
            setSelectedRefundReason('');
          }}
          message={
            <div className="space-y-4">
              <p className="text-center mb-4">환불 사유를 선택해주세요</p>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="refundReason"
                    value="CUSTOMER_REQUEST"
                    checked={selectedRefundReason === 'CHANGE_MIND'}
                    onChange={(e) => setSelectedRefundReason(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">단순 변심</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="refundReason"
                    value="WRONG_PRODUCT"
                    checked={selectedRefundReason === 'WRONG_PRODUCT'}
                    onChange={(e) => setSelectedRefundReason(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">다른 상품 배송</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="refundReason"
                    value="DEFECTIVE_PRODUCT"
                    checked={selectedRefundReason === 'DEFECTIVE_PRODUCT'}
                    onChange={(e) => setSelectedRefundReason(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">상품 파손 및 불량</span>
                </label>
              </div>
            </div>
          }
          onConfirm={handleRefund}
          rightButtonText="환불 요청"
          showCancel={true}
        />

        {showRefundErrorToast && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg">
            환불 처리에 실패했습니다.
          </div>
        )}
      </div>
    </div>
  );
}
