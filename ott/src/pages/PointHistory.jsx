import axiosInstance from '@/api/axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import TopBar from '../components/common/TopBar';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function getDescriptionText(desc) {
  switch (desc) {
    case 'SIGNUP':
      return '신규가입';
    case 'POST_CREATE':
      return '데스크 추천 게시글 작성';
    case 'PRODUCT_PURCHASE':
      return '상품 구매';
    case 'POPULAR_POST_SELECTED':
      return '인기 게시글 선정';
    default:
      return desc;
  }
}

export default function PointHistory() {
  const [point, setPoints] = useState([]);
  const [pagination, setPagination] = useState({
    size: 10,
    lastPointHistoryId: null,
    hasNext: true,
  });
  const [loading, setLoading] = useState(false);
  const observer = useRef();

  const fetchPoints = async (isNext = false) => {
    if (loading || (!pagination.hasNext && isNext)) return;
    setLoading(true);
    try {
      const params = {};
      if (isNext && pagination.lastPointHistoryId) params.cursorId = pagination.lastPointHistoryId;
      const res = await axiosInstance.get('/users/point', { params });
      const { point: newPoints, pagination: newPagination } = res.data.data;
      setPoints((prev) => (isNext ? [...prev, ...newPoints] : newPoints));
      setPagination(newPagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints(false);
  }, []);

  const lastItemRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && pagination.hasNext) {
          fetchPoints(true);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, pagination.hasNext],
  );

  return (
    <div className="max-w-[768px] mx-auto min-h-screen bg-white pb-24 px-4">
      <TopBar title="포인트 내역" showBack />
      <div className="max-w-[480px] mx-auto divide-y">
        {point.map((item, idx) => (
          <div
            key={item.historyId}
            ref={idx === point.length - 1 ? lastItemRef : null}
            className="py-4 flex flex-col gap-1"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{getDescriptionText(item.description)}</span>
              <span className={item.type === 'EARN' ? 'text-blue-600' : 'text-red-500'}>
                {item.type === 'EARN' ? '+' : '-'}
                {item.amount.toLocaleString()}P
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatDate(item.createdAt)}</span>
              <span>잔액: {item.balance_after.toLocaleString()}P</span>
            </div>
          </div>
        ))}
      </div>
      {loading && <div className="w-full text-center py-4 text-gray-400">불러오는 중...</div>}
    </div>
  );
}
