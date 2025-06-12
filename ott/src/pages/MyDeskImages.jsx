import axiosInstance from '@/api/axios';
import React, { useEffect, useState } from 'react';

function formatDate(createdAtStr) {
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  const now = new Date(Date.now() + KST_OFFSET);
  const createdUTC = new Date(createdAtStr);
  const createdKST = new Date(createdUTC.getTime() + KST_OFFSET);

  const diffMs = now - createdKST;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay === 0) {
    if (now.getDate() === createdKST.getDate()) return '오늘';
    return '어제';
  }
  if (diffDay === 1) return '어제';
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}주 전`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}달 전`;
  return `${Math.floor(diffDay / 365)}년 전`;
}

function groupByDate(images) {
  const groups = {};
  images.forEach((img) => {
    const label = formatDate(img.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(img);
  });
  return groups;
}

export default function MyDeskImages() {
  const [images, setImages] = useState([]);
  const [pagination, setPagination] = useState({ size: 10, lastAiImageId: null, hasNext: true });
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const fetchImages = async (isFirst = false) => {
    if (isFetching || (!pagination.hasNext && !isFirst)) return;
    setIsFetching(true);
    try {
      const params = { size: pagination.size };
      if (!isFirst && pagination.lastAiImageId) params.cursorId = pagination.lastAiImageId;
      const res = await axiosInstance.get('/users/me/desks', { params });
      const { images: newImages, pagination: newPagination } = res.data.data;
      setImages((prev) => (isFirst ? newImages : [...prev, ...newImages]));
      setPagination({
        size: newPagination.size,
        lastAiImageId: newPagination.lastAiImageId,
        hasNext: newPagination.hasNext,
      });
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(true);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        pagination.hasNext &&
        !isFetching
      ) {
        fetchImages(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pagination, isFetching]);

  const grouped = groupByDate(images);

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white pb-24 px-4">
      <h2 className="text-xl font-bold my-4 text-center">나의 데스크 보기</h2>
      {Object.entries(grouped).map(([label, group]) => (
        <div key={label} className="mb-6">
          <div className="font-bold text-lg mb-2">{label}</div>
          <div className="flex flex-col gap-4">
            {group.map((item) => (
              <div key={item.aiImageId} className="flex gap-4">
                {/* Before */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center overflow-hidden mb-1">
                    {item.beforeImagePath ? (
                      <img
                        src={item.beforeImagePath}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">Before</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 text-center">Before</div>
                </div>
                {/* After */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center overflow-hidden mb-1">
                    {item.afterImagePath ? (
                      <img
                        src={item.afterImagePath}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">After</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 text-center">After</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {loading && <div className="w-full text-center py-4 text-gray-400">불러오는 중...</div>}
    </div>
  );
}
