import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TopBar from '../components/common/TopBar';

const PaymentComplete = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleGoProducts = () => {
    navigate('/products');
  };

  const handleGoToOrderList = () => {
    navigate('/orders');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !orderData) {
    return (
      <div className="max-w-[768px] mx-auto min-h-screen bg-white pb-24 relative">
        <div className="fixed inset-0 bg-gray-100 -z-10 hidden sm:block" />
        <TopBar title="주문/결제" onBackClick={handleGoProducts} />
        <div className="max-w-[480px] mx-auto p-4 text-center mt-8">
          <p className="text-red-500">{error || '주문 정보를 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  const { products, payment } = orderData;
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const firstProduct = products[0];
  const itemName =
    products.length > 1 ? `${firstProduct.name} 외 ${products.length - 1}건` : firstProduct.name;
  const itemImage = firstProduct.imagePath;

  return (
    <div className="max-w-[768px] mx-auto min-h-screen bg-white pb-24 relative">
      <div className="fixed inset-0 bg-gray-100 -z-10 hidden sm:block" />
      <TopBar title="주문/결제" onBackClick={handleGoProducts} />
      <div className="max-w-[480px] mx-auto p-4">
        <h1 className="text-2xl font-bold mt-8 mb-8">결제가 완료되었습니다.</h1>

        <div className="w-full p-4 border border-gray-200 rounded-lg mb-8">
          <div className="flex items-center">
            {itemImage ? (
              <img
                src={itemImage}
                alt={itemName}
                className="w-20 h-20 object-cover rounded-md mr-4"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-md mr-4" />
            )}
            <div className="flex flex-col text-left">
              <span className="font-semibold">{itemName}</span>
              <span className="text-gray-600">
                {payment.paymentAmount?.toLocaleString() || '0'} P | {totalQuantity}개
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="font-semibold text-xl">저희 서비스를 이용해주셔서 감사합니다.</p>
          <p className="text-gray-600 mt-2">내 정보의 “주문내역 보기”에서 물품을 확인해주세요.</p>
          <p className="text-sm text-gray-500 mt-4">
            상품 지급에 다소 시간이 걸릴 수 있습니다. (최대 1일 소요)
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-black text-white font-bold py-3 px-4 rounded-lg mt-8 mb-4"
        >
          홈으로 이동
        </button>
      </div>
    </div>
  );
};

export default PaymentComplete;
