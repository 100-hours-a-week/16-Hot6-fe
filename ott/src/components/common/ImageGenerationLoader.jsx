import React, { useEffect, useState } from 'react';
import useImageGenerationStore from '@/store/imageGenerationStore';
import axiosInstance from '@/api/axios';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';

// 윈도우 너비를 확인하는 훅 추가
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

const POLL_INTERVAL = 10000; // 10초마다 폴링

const ImageGenerationLoader = () => {
  const { imageId, status, setStatus, reset } = useImageGenerationStore();
  const [toast, setToast] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showFailToast, setShowFailToast] = useState(false);
  const navigate = useNavigate();
  const windowWidth = useWindowWidth(); // 훅 사용

  useEffect(() => {
    if (status !== 'generating' || !imageId) return;

    let interval = setInterval(async () => {
      try {
        const res = await axiosInstance.get(`/ai-images/${imageId}`);

        if (res.data.data.image.state === 'SUCCESS') {
          setStatus('done');
          setShowToast(true);
          clearInterval(interval);
        } else if (res.data.data.image.state === 'FAILED') {
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

  useEffect(() => {
    if (toast) {
      setTimeout(() => setToast(''), 1500);
    }
  }, [toast]);

  if (!imageId || status === 'idle') return null;

  return (
    <>
      {/* 로딩바 (우측 상단 고정) */}
      <div
        className="fixed z-50 top-16 right-8 flex flex-col items-start gap-3"
        onClick={() => {
          if (status === 'done') {
            navigate(`/ai-images/${imageId}`);
            reset();
          }
        }}
        style={{
          opacity: status === 'done' ? 1 : 0.8,
          right: windowWidth >= 768 ? 'calc(50vw - 384px + 1rem)' : '1rem',
          maxWidth: windowWidth >= 768 ? 'calc(100vw - 32px)' : undefined,
        }}
      >
        {status === 'generating' ? (
          <svg className="animate-spin w-10 h-10 text-blue-500" viewBox="0 0 24 24">
            <circle
              className="opacity-75"
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
      <Toast />
      {showToast && <Toast message={'이미지 생성이 완료되었습니다.'} />}
      {showFailToast && <Toast message={'이미지 생성에 실패 했습니다.'} />}
    </>
  );
};

export default ImageGenerationLoader;
