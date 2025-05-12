import React, { useEffect, useState } from 'react';
import useImageGenerationStore from '@/store/imageGenerationStore';
import axiosInstance from '@/api/axios';
import { useNavigate } from 'react-router-dom';

const POLL_INTERVAL = 10000; // 10초마다 폴링

const ImageGenerationLoader = () => {
  const { imageId, status, setStatus, reset } = useImageGenerationStore();
  const [showToast, setShowToast] = useState(false);
  const [showFailToast, setShowFailToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ImageGenerationLoader - Current state:', { imageId, status });
    if (status !== 'generating' || !imageId) return;

    console.log('Starting polling for image:', imageId);
    let interval = setInterval(async () => {
      try {
        const res = await axiosInstance.get(`/ai-images/${imageId}`);
        console.log('Polling response:', res.data.data.status);
        if (res.data.data.image.status === 'SUCCESS') {
          setStatus('done');
          setShowToast(true);
          clearInterval(interval);
        } else if (res.data.data.image.status === 'FAILED') {
          reset();
          setShowFailToast(true);
          clearInterval(interval);
        }
      } catch (e) {
        console.log('Polling error:', e);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [imageId, status, setStatus]);

  // 토스트 메시지 자동 사라짐
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    if (showFailToast) {
      const timer = setTimeout(() => setShowFailToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showFailToast]);

  if (!imageId || status === 'idle') return null;

  return (
    <>
      {/* 로딩바 (우측 하단 고정) */}
      <div
        className="fixed z-50 right-6 bottom-[88px] w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg cursor-pointer"
        onClick={() => {
          if (status === 'done') {
            navigate(`/ai-images/${imageId}`);
            reset();
          }
        }}
        style={{ opacity: status === 'done' ? 1 : 0.8 }}
      >
        {status === 'generating' ? (
          <svg className="animate-spin w-10 h-10 text-gray-400" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              d="M8 12l2 2 4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {/* 토스트 메시지 */}
      {showToast && (
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg z-50 shadow-lg max-w-[768px] w-fit">
          이미지 생성이 완료되었습니다.
        </div>
      )}
      {showFailToast && (
        <div className="fixed bottom-40 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg z-50 shadow-lg max-w-[768px] w-fit">
          이미지 생성에 실패 했습니다.
        </div>
      )}
    </>
  );
};

export default ImageGenerationLoader;
