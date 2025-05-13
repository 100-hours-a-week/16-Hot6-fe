import React, { useState, useCallback, useEffect, useRef } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { useNavigate } from 'react-router-dom';

function AiImageBottomSheet({ open, onClose, onSelect }) {
  const [selected, setSelected] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiImageList, setAiImageList] = useState([]);
  const [hasNext, setHasNext] = useState(true);
  const [lastImageId, setLastImageId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  const SHEET_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 700;
  const TOPBAR_HEIGHT = 48;
  const CONTENT_HEIGHT = SHEET_HEIGHT - TOPBAR_HEIGHT;

  const fetchAiImages = useCallback(
    async (isInitial = false) => {
      if (!hasNext || isLoading) return;

      setIsLoading(true);
      try {
        const res = await axiosInstance.get('/users/me/desks', {
          params: {
            type: 'post',
            size: 10,
            lastImageId: isInitial ? null : lastImageId,
          },
        });

        const { images, hasNext: nextHasNext } = res.data.data;

        if (isInitial) {
          setAiImageList(images);
        } else {
          setAiImageList((prev) => [...prev, ...images]);
        }

        setHasNext(nextHasNext);
        if (images.length > 0) {
          setLastImageId(images[images.length - 1].aiImageId);
        }
      } catch (error) {
        console.error('AI 이미지 목록 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [hasNext, isLoading, lastImageId],
  );

  const handleScroll = useCallback(() => {
    if (!bottomRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = bottomRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      fetchAiImages();
    }
  }, [fetchAiImages]);

  useEffect(() => {
    const currentRef = bottomRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
      return () => currentRef.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    if (open) {
      fetchAiImages(true);
    }
  }, [open, fetchAiImages]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white max-w-[640px] mx-auto">
      {/* TopBar */}
      <div className="flex items-center justify-between px-4 h-12 border-b relative">
        <button className="p-2 -ml-2" onClick={onClose} aria-label="닫기">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-lg">
          전체 보기
        </span>
        <button
          className={`text-blue-600 font-semibold text-base ${selected ? '' : 'opacity-40 pointer-events-none'}`}
          onClick={() => {
            if (selected) {
              onSelect(selected);
              onClose();
            }
          }}
        >
          완료
        </button>
      </div>

      {/* 상단 이미지 영역 */}
      <div
        className="flex items-center justify-center transition-all duration-300 ease-in-out"
        style={{
          height: isExpanded ? CONTENT_HEIGHT / 2 : CONTENT_HEIGHT / 3,
          background: '#fff',
          borderBottom: '2px solid #eee',
        }}
      >
        {selected ? (
          <img
            src={selected.afterImagePath}
            alt="after"
            className="object-contain max-h-full max-w-full rounded-xl"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <span className="text-gray-400">이미지를 선택하세요</span>
        )}
      </div>

      {/* 하단 이미지 목록 영역 */}
      <div
        className="w-full bg-[#f8fafc] rounded-t-2xl overflow-hidden transition-all duration-300 ease-in-out transform translate-y-0"
        style={{
          height: isExpanded ? CONTENT_HEIGHT / 2 : (CONTENT_HEIGHT * 2) / 3,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div ref={bottomRef} className="overflow-y-auto h-full px-4 pt-4 pb-20">
          {aiImageList.length > 0 ? (
            <div className="space-y-3">
              {aiImageList.map((item) => (
                <div
                  key={item.aiImageId}
                  className={`relative bg-white rounded-lg border p-1 cursor-pointer transition-all ${
                    selected && selected.aiImageId === item.aiImageId ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => {
                    setSelected(item);
                    setIsExpanded(true);
                  }}
                >
                  <div className="flex gap-2">
                    {/* Before 이미지 */}
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Before</div>
                      <img
                        src={item.beforeImagePath}
                        alt="before"
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                    {/* After 이미지 */}
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">After</div>
                      <img
                        src={item.afterImagePath}
                        alt="after"
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  </div>
                  {/* 선택 표시 */}
                  {selected && selected.aiImageId === item.aiImageId && (
                    <span className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full -mt-12">
              <p className="text-gray-500 text-center mb-6">
                아직 이용 내역이 없습니다.
                <br />
                데스크셋업 AI 생성 서비스를 이용해 보시겠어요?
              </p>
              <button
                onClick={() => navigate('/desk')}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Desk AI로 이동하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AiImageBottomSheet;
