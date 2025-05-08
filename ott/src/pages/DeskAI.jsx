import React, { useRef, useState, useEffect } from 'react';
import axiosInstance from '@/api/axios';
import { useNavigate } from 'react-router-dom';
import SimpleModal from '@/components/common/SimpleModal';
import useImageGenerationStore from '@/store/imageGenerationStore';
import useDeskAICheck from '@/hooks/useDeskAICheck';

function resizeImage(file, maxSize = 1024) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };
    img.onload = () => {
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('이미지 리사이즈 실패'));
          }
        },
        file.type,
        0.9, // 이미지 품질 (0~1)
      );
    };
    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const DeskAI = () => {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const setImageId = useImageGenerationStore((state) => state.setImageId);
  const { checkDeskAIAvailability, modal, setModal } = useDeskAICheck();

  useEffect(() => {
    const checkAvailability = async () => {
      const isAvailable = await checkDeskAIAvailability();
      if (!isAvailable) {
        setModal((prev) => ({
          ...prev,
          onConfirm: () => navigate('/'),
        }));
      }
    };

    checkAvailability();
  }, []);

  // 이미지 업로드 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setModal({ open: true, message: '지원하지 않는 이미지 형식입니다.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setModal({ open: true, message: '이미지 크기는 최대 5MB까지 가능합니다.' });
      return;
    }

    setImage(file);
    setImageUrl(URL.createObjectURL(file));
    setError('');
  };

  // 이미지 전송
  const handleUpload = async () => {
    if (!image) return;
    setLoading(true);
    try {
      // 1. 리사이즈
      const resizedBlob = await resizeImage(image, 1024);
      const resizedFile = new File([resizedBlob], image.name, { type: image.type });

      // 2. FormData 생성
      const formData = new FormData();
      formData.append('beforeImagePath', resizedFile);

      // 3. 전송
      const response = await axiosInstance.post('/ai-images', formData, { timeout: 0 });
      const { imageId } = response.data; // 응답에서 imageId 추출
      console.log('Image upload successful, imageId:', imageId);
      setImageId(imageId); // 전역 상태에 저장
      console.log('ImageId set in store, navigating to home...');
      setLoading(false);
      navigate('/'); // 홈으로 이동
    } catch (err) {
      console.error('Image upload failed:', err);
      setLoading(false);
      setModal({ open: true, message: '이미지 업로드에 실패했습니다. 다시 시도해 주세요.' });
      setLastRequestTime(0);
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setModal({ open: false, message: '', onConfirm: null });
  };

  // 이미지 다시 고르기
  const handleResetImage = () => {
    setImage(null);
    setImageUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      // 파일 선택창 바로 열기
      setTimeout(() => fileInputRef.current.click(), 0);
    }
  };

  // 이미지 업로드 or 생성 버튼 클릭
  const handleButtonClick = async () => {
    if (!image) {
      fileInputRef.current.click();
      return;
    }
    const now = Date.now();
    if (now - lastRequestTime < 30 * 1000) {
      setModal({ open: true, message: '잠시 후 다시 시도해주세요.' });
      return;
    }
    setLastRequestTime(now);
    await handleUpload();
  };

  return (
    <div className="px-4 mb-8">
      <div className="max-w-[640px] mx-auto bg-white min-h-screen px-4 pt-6 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-center mb-6">당신의 책상을 완성하세요</h2>

        {/* 이미지 미리보기 영역 */}
        <div className="relative w-full max-w-lg aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt="업로드 이미지 미리보기"
                className="object-contain object-center w-full h-full"
              />
              <button
                className="absolute bottom-2 right-2 px-3 py-1 border border-gray-400 rounded-lg bg-white text-sm"
                onClick={handleResetImage}
              >
                다시 고르기
              </button>
            </>
          ) : (
            <span className="text-gray-400 text-center px-4">
              이곳에 업로드된 이미지가 표시됩니다.
            </span>
          )}
        </div>

        {/* 파일 업로드 input (숨김) */}
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        {/* 업로드/생성 버튼 */}
        <button
          className={`w-full max-w-lg h-12 rounded-xl text-white text-lg font-semibold mb-4 ${
            image ? 'bg-blue-500' : 'bg-gray-400'
          }`}
          onClick={handleButtonClick}
          disabled={loading}
        >
          {loading ? '업로드 중...' : image ? '이미지 생성' : '이미지 업로드'}
        </button>

        {/* 에러 메시지 */}
        {error && (
          <div className="w-full bg-gray-200 text-center text-gray-700 rounded-lg py-3 mt-2">
            {error}
          </div>
        )}

        {/* 모달 */}
        <SimpleModal
          open={modal.open}
          message={modal.message}
          onClose={handleCloseModal}
          onConfirm={modal.onConfirm}
        />
      </div>
    </div>
  );
};

export default DeskAI;
