// Order.jsx
import SimpleModal from '@/components/common/SimpleModal';
import TopBar from '@/components/common/TopBar';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Order() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentErrorToast, setShowPaymentErrorToast] = useState(false);
  const [toast, setToast] = useState('');
  const [forbiddenModal, setForbiddenModal] = useState(false);

  // 주문 상세 데이터 불러오기
  const fetchOrderData = async () => {
    try {
      const response = await axios.get(`/orders/${orderId}`);
      setOrderData(response.data.data);
      setError(null);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setForbiddenModal(true);
        return;
      }
      setError('주문 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 결제 처리
  const handlePayment = async () => {
    try {
      await axios.post(`/orders/${orderId}/payments`, {
        point: payment.paymentAmount,
      });
      setToast('결제가 완료되었습니다.');
      navigate('/orders');
    } catch {
      setShowPaymentErrorToast(true);
      setTimeout(() => setShowPaymentErrorToast(false), 3000);
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

  const { order, product, user, payment } = orderData;

  return (
    <>
      <TopBar
        title="주문/결제"
        showBack
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full z-40 h-14 bg-white flex items-center px-4"
        style={{
          maxWidth: '480px',
          minWidth: 'min(320px, 100%)',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      />
      <div style={{ height: 'calc(56px + env(safe-area-inset-top))' }} />

      <div className="px-4 pt-6">
        <h3 className="font-semibold mb-4">주문자 정보</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm">
            <span className="text-gray-500">닉네임:</span> {user.nicknameKakao}
          </p>
          <p className="text-sm mt-1">
            <span className="text-gray-500">이메일:</span> {user.email}
          </p>
        </div>
      </div>

      <div className="px-4 pt-6">
        <h3 className="font-semibold mb-4">주문상품</h3>
        <div className="space-y-4">
          {product.map((item) => (
            <div key={item.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img src={item.imagePath} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 ml-4">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {item.price.toLocaleString()} P × {item.quantity}개
                </p>
                {item.status && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-gray-200 text-gray-700">
                    {item.status}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="font-medium">{(item.price * item.quantity).toLocaleString()} P</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-6 pb-24">
        <h3 className="font-semibold mb-4">결제 정보</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">결제 수단</span>
            <span>{payment.payment_method}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">총 상품 금액</span>
            <span>{payment.paymentAmount.toLocaleString()} P</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">할인 금액</span>
            <span className="text-red-500">-{payment.discountAmount.toLocaleString()} P</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">총 결제 금액</span>
              <span className="text-xl font-bold">{payment.paymentAmount.toLocaleString()} P</span>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 버튼 */}
      {order.status === 'PENDING' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50">
          <button
            className="w-full py-3 bg-gray-700 text-white rounded text-sm font-semibold hover:bg-blue-700"
            onClick={() => setShowPaymentModal(true)}
          >
            결제하기
          </button>
        </div>
      )}

      <SimpleModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePayment}
        message="결제를 진행하시겠습니까?"
        rightButtonText="결제하기"
      />

      {showPaymentErrorToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg">
          결제 처리에 실패했습니다.
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg">
          {toast}
        </div>
      )}

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
    </>
  );
}
