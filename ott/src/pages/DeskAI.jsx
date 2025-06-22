import axiosInstance from '@/api/axios';
import SimpleModal from '@/components/common/SimpleModal';
import useDeskAICheck from '@/hooks/useDeskAICheck';
import useImageGenerationStore from '@/store/imageGenerationStore';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/common/Toast';

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
  const [loading, setLoading] = useState(false); // 이미지 생성 요청 로딩 상태
  const [uploading, setUploading] = useState(false); // 이미지 업로드 자체의 로딩 상태 (파일 읽기 및 미리보기)
  const [selectedConcept, setSelectedConcept] = useState('BASIC'); // 선택된 concept 상태 추가
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const setImageId = useImageGenerationStore((state) => state.setImageId);
  const { checkDeskAIAvailability, modal, setModal, quota } = useDeskAICheck();
  const [toast, setToast] = useState('');

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

  // 이미지 업로드 핸들러 (파일 선택 후 처리)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true); // 업로드 시작 표시

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setModal({ open: true, message: '지원하지 않는 이미지 형식입니다.' });
      setUploading(false);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setModal({ open: true, message: '이미지 크기는 최대 5MB까지 가능합니다.' });
      setUploading(false);
      return;
    }

    // 파일을 읽어 미리보기 URL 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(file);
      setImageUrl(reader.result); // base64 URL 또는 데이터 URL
      setError('');
      setUploading(false); // 업로드 완료 표시
    };
    reader.onerror = () => {
      setError('파일 읽기에 실패했습니다.');
      setUploading(false);
    };
    reader.readAsDataURL(file); // 파일 내용을 Data URL로 읽기
  };

  // 이미지 생성 요청 (업로드 및 AI 처리)
  const requestImageGeneration = async () => {
    if (!image) return;

    const now = Date.now();
    if (now - lastRequestTime < 30 * 1000) {
      setModal({ open: true, message: '잠시 후 다시 시도해주세요.' });
      return;
    }
    setLastRequestTime(now);
    setLoading(true);

    try {
      // 1. 리사이즈
      const resizedBlob = await resizeImage(image, 1024);
      const resizedFile = new File([resizedBlob], image.name, { type: image.type });

      // 2. FormData 생성
      const formData = new FormData();
      formData.append('beforeImagePath', resizedFile);
      formData.append('concept', selectedConcept); // concept 값 추가

      // 3. 전송
      const response = await axiosInstance.post('/ai-images', formData, { timeout: 0 });
      const { aiImageId } = response.data.data;

      setImageId(aiImageId); // 전역 상태에 저장 (AI 결과 페이지에서 사용)

      setLoading(false); // 이미지 생성 요청 로딩 완료
      navigate('/', {
        state: { toast: '이미지 전송 성공' },
      });
    } catch (err) {
      setLoading(false); // 이미지 생성 요청 로딩 완료

      if (err.response && err.response.status === 400) {
        setModal({
          open: true,
          message: '책상 사진이 아닙니다.\n책상이 잘 나오도록 사진을 다시 업로드해주세요.',
          onConfirm: () => setModal({ open: false, message: '' }), // 확인 버튼 누르면 모달 닫기
        });
      } else if (err.response && err.response.status === 403) {
        setModal({
          open: true,
          message: '금일 이미지 생성 토큰을 모두 사용하셨습니다.',
          onConfirm: () => setModal({ open: false, message: '' }),
        });
      } else {
        setToast('이미지 생성 요청에 실패했습니다. 다시 시도해 주세요.');
        setTimeout(() => setToast(''), 1500); // 토스트 메시지 1.5초 후 사라짐
      }
      setLastRequestTime(0); // 실패 시 재요청 가능하도록 시간 초기화
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
      fileInputRef.current.value = ''; // 파일 입력값 초기화
      // 파일 선택창 바로 열기
      setTimeout(() => fileInputRef.current.click(), 0);
    }
  };

  // 숨겨진 파일 입력 트리거 (이 함수는 이제 이미지 없을 때 업로드 영역 클릭 시 사용)
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="px-4 mb-8">
      <div className="max-w-[640px] mx-auto bg-white min-h-screen px-4 pt-6 flex flex-col items-center">
        {/* 히어로 카피 */}
        <h2 className="text-2xl font-bold text-center mb-6">
          당신의 책상 사진을 올리면
          <br></br> AI가 최적의 데스크셋업을 추천해드려요
        </h2>
        {quota !== null && (
          <p className="text-gray-600 text-base font-semibold mb-4 text-center">
            🪄 오늘 남은 이미지 생성 가능 횟수: <strong>{quota}회</strong>
          </p>
        )}
        {/* 이미지 미리보기 영역 */}
        {imageUrl ? (
          // 이미지가 있을 경우
          <div className="relative w-full max-w-lg aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
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
          </div>
        ) : (
          // 이미지가 없을 경우 (업로드 영역)
          <button
            className="relative w-full max-w-lg aspect-square bg-gray-100 rounded-2xl mb-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 cursor-pointer text-gray-400"
            onClick={triggerFileInput} // 클릭 시 파일 선택 트리거
            disabled={uploading} // 파일 업로드 중에는 비활성화
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            ) : (
              <>
                {/* 업로드 아이콘 */}
                <svg
                  className="w-12 h-12 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                {/* 플레이스홀더 텍스트 */}
                <span className="text-center px-4">
                  책상 전체가 잘 보이도록 사진을 올려주세요
                  <br />• 실물 책상 or 원하는 스타일 예시
                </span>
              </>
            )}
          </button>
        )}

        {/* 세부 가이드 */}
        <div className="w-full max-w-lg text-sm text-gray-500 mb-6">
          <p>• 파일 형식: JPG, PNG (최대 5MB)</p>
          <p>• 책상 전면과 주변 소품이 모두 보이게 촬영해주세요</p>
        </div>

        {/* 스타일 선택 라디오 버튼 */}
        <div className="w-full max-w-lg mb-6">
          <p className="text-sm font-semibold mb-3">원하는 스타일을 선택해주세요</p>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="concept"
                value="BASIC"
                checked={selectedConcept === 'BASIC'}
                onChange={(e) => setSelectedConcept(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">기본 스타일</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="concept"
                value="CARTOON"
                checked={selectedConcept === 'CARTOON'}
                onChange={(e) => setSelectedConcept(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">카툰 스타일</span>
            </label>
          </div>
        </div>

        {/* 파일 업로드 input (숨김) - 실제 파일 선택 창 역할 */}
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        {/* 이미지 생성 버튼 */}
        <button
          className={`w-full max-w-lg h-12 rounded-xl text-white text-lg font-semibold mb-4 transition-colors duration-200 ${
            image && !loading && quota > 0
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={requestImageGeneration} // 이미지 생성 요청 함수 호출
          disabled={!image || loading || quota === 0} // 이미지가 없거나 로딩 중일 때 비활성화
        >
          {loading
            ? '생성 중...'
            : quota === 0
              ? '오늘 생성 횟수를 모두 사용했어요'
              : '이미지 생성'}
        </button>

        {/* 에러 메시지 */}
        {error && (
          <div className="w-full bg-gray-200 text-center text-gray-700 rounded-lg py-3 mt-2">
            {error}
          </div>
        )}

        {/* Toast 메시지 표시 */}
        <Toast message={toast} />

        {/* 모달 컴포넌트 */}
        <SimpleModal
          open={modal.open}
          message={modal.message}
          onClose={handleCloseModal}
          onConfirm={modal.onConfirm} // 확인 버튼 클릭 시 실행될 함수 (nullable)
          confirmText={modal.onConfirm ? '확인' : null} // onConfirm 함수가 있을 때만 확인 버튼 표시
          showCancel={modal.onConfirm === null} // onConfirm 함수가 없을 때만 취소 버튼 표시 (기본 닫기)
        />
      </div>
    </div>
  );
};

export default DeskAI;
