import axiosInstance from '@/api/axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';
import TopBar from '../components/common/TopBar';

function formatDate(createdAtStr) {
  const now = new Date();
  const createdKST = new Date(createdAtStr);

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
  const navigate = useNavigate();
  const [toast, setToast] = useState('');

  const handleImageClick = async (aiImageId) => {
    if (!aiImageId) {
      setToast('이미지를 불러올 수 없습니다.');
      setTimeout(() => setToast(''), 1500);
      return;
    }

    try {
      await axiosInstance.get(`/ai-images/${aiImageId}`);
      navigate(`/ai-images/${aiImageId}`);
    } catch (err) {
      console.log('에러 발생:', err);
      if (err.response.status === 404) {
        setToast(
          `죄송합니다. 요청하신 페이지를 찾을 수 없습니다.\n시스템 업데이트 중 정보가 삭제되었거나 이동되었을 수 있습니다.`,
        );
        setTimeout(() => setToast(''), 1500);
        return;
      }
      setToast('이미지를 불러올 수 없습니다.');
      setTimeout(() => setToast(''), 1500);
    }
  };

  const fetchImages = async (isFirst = false) => {
    if (isFetching || (!pagination.hasNext && !isFirst)) return;
    setIsFetching(true);
    try {
      const response = await axiosInstance.get('/users/me/desks', {
        params: {
          size: pagination.size,
          cursorId: isFirst ? null : pagination.lastAiImageId,
        },
      });

      const newImages = response.data.data.images;

      if (isFirst) {
        setImages(newImages);
      } else {
        setImages((prev) => [...prev, ...newImages]);
      }

      setPagination({
        size: pagination.size,
        lastAiImageId: response.data.data.pagination.lastAiImageId,
        hasNext: response.data.data.pagination.hasNext,
      });
    } catch (err) {
      console.log('에러 발생:', err);
      setToast('이미지를 불러올 수 없습니다.');
      setTimeout(() => setToast(''), 1500);
    } finally {
      setLoading(false);
      setIsFetching(false);
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
    <div className="max-w-[768px] mx-auto min-h-screen bg-white pb-24">
      <div className="fixed inset-0 bg-gray-100 -z-10 hidden sm:block" />
      <TopBar title="나의 데스크 보기" />
      <div className="max-w-[480px] mx-auto mt-4">
        {Object.keys(grouped).length === 0 && !loading ? (
          <div className="text-center text-gray-400 py-20">생성한 데스크 이미지가 없습니다.</div>
        ) : (
          Object.entries(grouped).map(([label, group]) => (
            <div key={label} className="mb-6">
              <div className="font-bold text-lg mb-2">{label}</div>
              <div className="flex flex-col gap-4">
                {group.map((item) => (
                  <div key={item.aiImageId} className="flex gap-4">
                    {/* Before */}
                    <div className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full h-24 bg-gray-100 rounded flex items-center justify-center overflow-hidden mb-1 cursor-pointer"
                        onClick={() => handleImageClick(item.aiImageId)}
                      >
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
                      <div
                        className="w-full h-24 bg-gray-100 rounded flex items-center justify-center overflow-hidden mb-1 cursor-pointer"
                        onClick={() => handleImageClick(item.aiImageId)}
                      >
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
          ))
        )}
      </div>
      {loading && <LoadingSpinner />}
      <Toast message={toast} />
    </div>
  );
}
