import axiosInstance from '@/api/axios';
import useImageGenerationStore from '@/store/imageGenerationStore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';

const BottomBanner = ({ onClick }) => (
  <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[90vw] max-w-sm bg-white rounded-xl shadow-lg p-4 flex flex-col items-center border border-gray-200">
    <span className="text-base font-semibold mb-2 text-gray-900">🎉 이미지 생성이 완료됐어요!</span>
    <button
      onClick={onClick}
      className="mt-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-base"
    >
      이미지 보러 가기
    </button>
  </div>
);

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

const POLL_INTERVAL = 10000;

const ImageGenerationLoader = () => {
  const { imageId, status, setStatus, reset } = useImageGenerationStore();
  const [showFailToast, setShowFailToast] = useState(false);
  const navigate = useNavigate();
  const windowWidth = useWindowWidth();

  useEffect(() => {
    if (status !== 'generating' || !imageId) return;

    let interval = setInterval(async () => {
      try {
        const res = await axiosInstance.get(`/ai-images/${imageId}`);

        if (res.data.data.image.state === 'SUCCESS') {
          setStatus('done');
          clearInterval(interval);
        } else if (res.data.data.image.state === 'FAILED') {
          setStatus('failed');
          setShowFailToast(true);
          clearInterval(interval);
        }
      } catch (e) {
        setStatus('failed');
        setShowFailToast(true);
        clearInterval(interval);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [imageId, status, setStatus]);

  useEffect(() => {
    if (showFailToast) {
      const timeout = setTimeout(() => setShowFailToast(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [showFailToast]);

  if (!imageId || status === 'idle') return null;

  return (
    <>
      {/* 스피너는 generating일 때만 */}
      {status === 'generating' && (
        <div
          className="fixed z-50 top-16 right-8 flex flex-col items-start gap-3"
          style={{
            opacity: 0.9,
            right: windowWidth >= 768 ? 'calc(50vw - 384px + 1rem)' : '1rem',
            maxWidth: windowWidth >= 768 ? 'calc(100vw - 32px)' : undefined,
          }}
        >
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
        </div>
      )}

      {/* 성공하면 배너 */}
      {status === 'done' && (
        <BottomBanner
          onClick={() => {
            navigate(`/ai-images/${imageId}`);
            reset();
          }}
        />
      )}

      {/* 실패하면 토스트 */}
      {showFailToast && <Toast message={'이미지 생성에 실패했습니다.'} />}
    </>
  );
};

export default ImageGenerationLoader;
