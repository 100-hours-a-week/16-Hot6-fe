import axiosInstance from '@/api/axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ScrapList() {
  const [scraps, setScraps] = useState([]);
  const [pagination, setPagination] = useState({ size: 10, lastScrapId: null, hasNext: true });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const observer = useRef();

  const fetchScraps = async (isNext = false) => {
    if (loading || (!pagination.hasNext && isNext)) return;
    setLoading(true);
    try {
      const params = { size: 10 };
      if (isNext && pagination.lastScrapId) params.cursorId = pagination.lastScrapId;
      const res = await axiosInstance.get('/users/me/scraps', { params });
      const { scraps: newScraps, pagination: newPagination } = res.data.data;
      setScraps((prev) => (isNext ? [...prev, ...newScraps] : newScraps));
      setPagination(newPagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScraps(false);
  }, []);

  // 무한 스크롤용 Intersection Observer
  const lastItemRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && pagination.hasNext) {
          fetchScraps(true);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, pagination.hasNext],
  );

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white pb-24 px-4">
      <h2 className="text-xl font-bold my-4 text-center">스크랩 목록</h2>
      {scraps.length === 0 && !loading ? (
        <div className="text-center text-gray-400 py-20">스크랩한 항목이 없습니다.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {scraps.map((item, idx) => (
            <div
              key={item.scrapId}
              ref={idx === scraps.length - 1 ? lastItemRef : null}
              className="border rounded-lg p-2 cursor-pointer"
              onClick={() => {
                if (item.type === 'POST') navigate(`/posts/${item.targetId}`);
                else if (item.type === 'PRODUCT') navigate(`/products/${item.targetId}`);
              }}
            >
              <img
                src={item.thumbnailUrl}
                alt="썸네일"
                className="w-full h-24 object-cover rounded"
              />
              <div className="mt-2 text-xs text-gray-500">
                {item.type === 'POST' ? '게시글' : '제품'}
              </div>
            </div>
          ))}
        </div>
      )}
      {loading && <div className="w-full text-center py-4 text-gray-400">불러오는 중...</div>}
    </div>
  );
}
