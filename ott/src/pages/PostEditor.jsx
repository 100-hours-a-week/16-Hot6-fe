import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopBar from '../components/common/TopBar';
import SimpleModal from '../components/common/SimpleModal';
import axiosInstance from '@/api/axios';
import ImagePreview from '../components/common/ImagePreview';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AiImageBottomSheet from '../components/common/AiImageBottomSheet';

const categories = [
  { value: 'ai', label: 'AI' },
  { value: 'free', label: '자유' },
];

export default function PostEditor() {
  const [category, setCategory] = useState(null);
  const [showImageSheet, setShowImageSheet] = useState(false);
  const [aiImageList, setAiImageList] = useState([]);
  const [selectedAiImageId, setSelectedAiImageId] = useState(null);
  const [selectedAiImage, setSelectedAiImage] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [title, setTitle] = useState('');
  const [isTitleValid, setIsTitleValid] = useState(false);
  const [isContentValid, setIsContentValid] = useState(false);
  const [content, setContent] = useState('');
  const [titleHelper, setTitleHelper] = useState('');
  const [contentHelper, setContentHelper] = useState('');
  const [titleTouched, setTitleTouched] = useState(false);
  const [contentTouched, setContentTouched] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showImageListErrorModal, setShowImageListErrorModal] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [freeImages, setFreeImages] = useState([]);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [searchParams] = useSearchParams();
  const imageId = searchParams.get('imageId');
  const postId = searchParams.get('postId');
  const mode = searchParams.get('mode');
  const isEditMode = mode === 'edit';
  const [aiImage, setAiImage] = useState(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [existingImageIds, setExistingImageIds] = useState({});
  const [removedImageIds, setRemovedImageIds] = useState([]);

  const beforeInputRef = useRef();
  const afterInputRef = useRef();

  // 자유 카테고리 이미지 선택
  const fileInputRef = useRef();
  const handleUserImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) setUserImage(file);
  };

  const handleFreeImageButtonClick = () => {
    fileInputRef.current.click();
  };

  // AI 카테고리 이미지 쌍 선택
  const handleAiImageSelect = (item) => {
    setSelectedAiImageId(item.aiImageId);
    setSelectedAiImage(item);
    setShowImageSheet(false);
  };

  // 자유 카테고리 이미지 선택
  const handleFreeImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    let overSize = false;

    for (const file of files) {
      const ext = file.name.toLowerCase().match(/\.(jpg|jpeg|png)$/);
      if (!ext) continue;
      if (file.size > 5 * 1024 * 1024) {
        overSize = true;
        continue;
      }
      validFiles.push(file);
    }

    if (overSize) {
      alert('5MB가 넘는 이미지는 업로드할 수 없습니다.');
    }

    // 전체 이미지 개수 체크 (기존 이미지 + 새로 추가할 이미지)
    const totalImages = freeImages.length + validFiles.length;
    if (totalImages > 5) {
      alert('이미지는 최대 5개까지 선택할 수 있습니다.');
      return;
    }

    setFreeImages((prev) => [...prev, ...validFiles]);
  };

  // 이미지 삭제
  const handleRemoveImage = (idx) => {
    setFreeImages((prev) => prev.filter((_, i) => i !== idx));
    // 삭제 후 캐러셀 인덱스 조정
    setCarouselIdx((prevIdx) => {
      if (prevIdx === 0) return 0; // 첫 번째 이미지 삭제 시
      if (prevIdx >= idx) return prevIdx - 1; // 현재 인덱스 이후의 이미지 삭제 시
      return prevIdx; // 현재 인덱스 이전의 이미지 삭제 시
    });
  };

  const getImageUrl = (file) => (file ? URL.createObjectURL(file) : null);

  // 2자 이상 50자 이하, 한글·영문·숫자
  // 공백, 마침표(.), 쉼표(,), 물음표(?), 느낌표(!), 하이픈(-) 허용, 앞뒤 공백 불가 (trim 후 검사)
  function validateTitle(rawTitle) {
    const title = rawTitle.trim();
    const regex = /^(?=.{2,51}$)(?!\s)(?!.*\s$)[ㄱ-ㅎㅏ-ㅣ가-힣A-Za-z0-9.,?!\-\s]+$/;
    return regex.test(title);
  }

  function validateContent(str) {
    const CONTENT_REGEX = /^[^\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]{1,1001}$/u;
    return CONTENT_REGEX.test(str);
  }

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setIsTitleValid(validateTitle(newTitle));
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setIsContentValid(validateContent(newContent));
  };

  const isSubmitEnabled =
    (category === 'ai'
      ? isTitleValid && isContentValid && (selectedAiImageId || (imageId && aiImage))
      : isTitleValid && isContentValid) && !isSubmitting;

  // 게시글 정보 불러오기
  useEffect(() => {
    // 수정 모드일 때
    if (isEditMode && postId) {
      const fetchPost = async () => {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get(`/posts/${postId}`);
          const postData = response.data.data;
          setTitle(postData.title);
          setContent(postData.content);
          setCategory(postData.type === 'AI' ? 'ai' : 'free');
          setIsTitleValid(validateTitle(postData.title));
          setIsContentValid(validateContent(postData.content));

          if (postData.type === 'AI') {
            setSelectedAiImage({
              beforeImagePath: postData.imageUrls[0].beforeImagePath,
              afterImagePath: postData.imageUrls[0].afterImagePath,
              aiImageId: postData.imageUrls[0].aiImageId,
            });
            setSelectedAiImageId(postData.imageUrls[0].id);
          } else {
            // 자유 게시판 이미지 처리
            const imageIds = postData.imageUrls.reduce((acc, img) => {
              acc[img.imageUuid] = img.sequence;
              return acc;
            }, {});
            setExistingImageIds(imageIds);
            setFreeImages(postData.imageUrls.map((img) => img.imageUuid));
          }
        } catch (error) {
          console.error('게시글 불러오기 실패:', error);
          setShowErrorModal(true);
        } finally {
          setIsLoading(false);
        }
      };

      fetchPost();
    } else {
      setCategory('ai');
      setIsLoading(false);
    }
  }, [isEditMode, postId]);

  // 제출 핸들러 수정
  const handleSubmit = async () => {
    if (category === 'ai') {
      if (
        !isTitleValid ||
        !isContentValid ||
        (!selectedAiImageId && !(isEditMode ? aiImage : imageId && aiImage))
      )
        return;
      setIsSubmitting(true);
      try {
        const aiImageIdToSend = selectedAiImageId || imageId;
        const endpoint = isEditMode ? `/posts/ai/${postId}` : '/posts/ai';
        const method = isEditMode ? 'patch' : 'post';

        const response = await axiosInstance[method](endpoint, {
          title,
          content,
          ai_image_id: aiImageIdToSend,
        });

        if (response.status === (isEditMode ? 200 : 201)) {
          if (isEditMode) {
            navigate(-1); // 수정 모드: 이전 페이지로
          } else {
            navigate('/posts'); // 작성 모드면 게시글 목록으로 이동
          }
        }
      } catch (error) {
        setShowErrorModal(true);
      } finally {
        setIsSubmitting(false);
      }
    } else if (category === 'free') {
      if (!isTitleValid || !isContentValid) return;

      // 전체 이미지 개수 체크
      if (freeImages.length > 5) {
        alert('이미지는 최대 5개까지 선택할 수 있습니다.');
        return;
      }

      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);

        // 새로 추가된 이미지 리사이즈 후 append
        for (const file of freeImages) {
          if (file instanceof File) {
            // 새로 추가된 이미지인 경우에만 리사이즈
            const resizedBlob = await resizeImage(file, 1024);
            const resizedFile = new File([resizedBlob], file.name, { type: file.type });
            formData.append('images', resizedFile);
          } else {
            formData.append('existingImageIds', existingImageIds[file]);
          }
        }

        const endpoint = isEditMode ? `/posts/free/${postId}` : '/posts/free';
        const method = isEditMode ? 'patch' : 'post';

        const response = await axiosInstance[method](endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.status === (isEditMode ? 200 : 201)) {
          if (isEditMode) {
            navigate(-1); // 수정 모드: 이전 페이지로
          } else {
            navigate('/posts'); // 작성 모드면 게시글 목록으로 이동
          }
        }
      } catch (error) {
        console.log(error);
        setShowErrorModal(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // 캐러셀 이동
  const goPrev = () => setCarouselIdx((idx) => Math.max(0, idx - 1));
  const goNext = () => setCarouselIdx((idx) => Math.min(freeImages.length - 1, idx + 1));

  useEffect(() => {
    console.log('imageId', imageId);
    if (imageId) {
      axiosInstance.get(`/ai-images/${imageId}`).then((res) => {
        setAiImage(res.data.data.image);
        console.log(res.data.data.image);
      });
    }
  }, [imageId]);

  // 카테고리가 설정되지 않은 경우 로딩 상태 표시
  if (category === null) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-[768px] mx-auto min-h-screen bg-white pb-32 relative">
      {/* 배경 오버레이 (768px 이상일 때 회색 배경) */}
      <div className="fixed inset-0 bg-gray-100 -z-10 hidden sm:block" />
      {/* TopBar */}
      <TopBar
        title={isEditMode ? '게시글 수정' : '게시글 작성'}
        showBack
        onBackClick={() => setShowLeaveModal(true)}
      />

      <div className="px-4 py-6">
        {/* 카테고리 드롭다운 */}
        <div className="mb-4">
          <label className="block font-bold mb-1">카테고리</label>
          <select
            className={`w-full border rounded-lg px-3 py-2 ${
              isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            value={category}
            onChange={(e) => {
              const newCategory = e.target.value;
              setCategory(newCategory);
              setTitle('');
              setContent('');
              setTitleTouched(false);
              setContentTouched(false);
              setUserImage(null);
              setFreeImages([]);
              setSelectedAiImageId(null);
              setSelectedAiImage(null);
              setAiImageList([]);
              setTitleHelper('');
              setContentHelper('');
              setIsTitleValid(false);
              setIsContentValid(false);
              setCarouselIdx(0);
            }}
            disabled={isEditMode || imageId} // 수정 모드, AI 게시글 작성일 때 비활성화
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* 이미지 선택 버튼 */}
        {category === 'free' && !aiImage && (
          <button
            className="flex items-center gap-2 border rounded-lg px-4 py-2 bg-gray-100 mb-4"
            onClick={handleFreeImageButtonClick}
          >
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            이미지 선택
            <input
              type="file"
              accept="image/jpeg, image/png"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFreeImageSelect}
            />
          </button>
        )}

        {/* 자유 카테고리: 이미지 미리보기 */}
        {category === 'free' && freeImages.length > 0 && (
          <ImagePreview
            images={freeImages}
            carouselIdx={carouselIdx}
            onRemove={handleRemoveImage}
            onSelect={setCarouselIdx}
          />
        )}

        {/* AI 이미지 선택 버튼 */}
        {category === 'ai' && (
          <button
            className="flex items-center gap-2 border rounded-lg px-4 py-2 bg-gray-100 mb-4"
            onClick={() => setShowImageSheet(true)}
          >
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            이미지 선택
          </button>
        )}

        {/* AI 카테고리: 선택된 이미지 쌍 미리보기 */}
        {category === 'ai' && selectedAiImage ? (
          <div className="flex gap-4 px-4 mt-6 mb-6">
            <div className="flex-1 flex flex-col items-center">
              <div className="font-bold mb-1">Before</div>
              <div className="min-w-[160px] min-h-[160px] w-full max-w-[300px] aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={selectedAiImage.beforeImagePath}
                  alt="before"
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="font-bold mb-1">After</div>
              <div className="min-w-[160px] min-h-[160px] w-full max-w-[300px] aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={selectedAiImage.afterImagePath}
                  alt="after"
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </div>
        ) : (
          aiImage && (
            <div className="flex justify-center gap-4 mb-4">
              <img
                src={aiImage.beforeImagePath}
                alt="before"
                className="w-40 h-40 object-cover rounded-xl"
              />
              <img
                src={aiImage.afterImagePath}
                alt="after"
                className="w-40 h-40 object-cover rounded-xl"
              />
            </div>
          )
        )}

        {/* 제목 입력 */}
        <div className="mb-2">
          <label className="block font-bold mb-1">제목</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-lg focus:border-blue-500 outline-none"
            placeholder="제목을 입력하세요 (2~50자, 한글·영문·숫자 및 . , ? ! - 허용)"
            value={title}
            onChange={handleTitleChange}
            onBlur={() => {
              if (!validateTitle(title)) {
                setTitleHelper(
                  '* 제목은 2~50자, 앞뒤 공백 없이 한글·영문·숫자·. , ? ! - 만 허용합니다.',
                );
              } else {
                setTitleHelper('');
              }
            }}
            maxLength={50}
          />
          {!isTitleValid && <div className="text-xs text-red-500 mt-1">{titleHelper}</div>}
        </div>

        {/* 내용 입력 */}
        <div className="mb-2">
          <label className="block font-bold mb-1">내용</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 min-h-[180px] text-base focus:border-blue-500 outline-none"
            placeholder="게시글 내용을 입력하세요"
            value={content}
            onChange={handleContentChange}
            onBlur={() => {
              if (!validateContent(content)) {
                setContentHelper('* 최대 1,000자까지 입력 가능(탭·줄바꿈 허용)합니다.');
              } else {
                setContentHelper('');
              }
            }}
            maxLength={1000}
          />
          {!isContentValid && <div className="text-xs text-red-500 mt-1">{contentHelper}</div>}
        </div>
      </div>

      {/* 작성 완료 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[640px] px-4 pb-6 bg-white z-50">
        <button
          className={`w-full py-3 rounded-lg text-white font-bold text-lg shadow-md transition-colors ${
            isSubmitEnabled ? 'bg-black hover:bg-gray-800' : 'bg-gray-300 cursor-not-allowed'
          }`}
          disabled={!isSubmitEnabled}
          onClick={handleSubmit}
        >
          {isSubmitting ? '전송 중...' : isEditMode ? '수정 완료' : '작성 완료'}
        </button>
      </div>

      {/* AiImageBottomSheet 컴포넌트 */}
      <AiImageBottomSheet
        open={showImageSheet}
        onClose={() => setShowImageSheet(false)}
        onSelect={handleAiImageSelect}
      />

      {/* Coming Soon Modal */}
      <SimpleModal
        open={showComingSoonModal}
        message={'서비스 준비 중입니다.\n곧 더 나은 모습으로 찾아뵙겠습니다.'}
        onClose={() => setShowComingSoonModal(false)}
      />

      {/* Error Modal (이미지 목록) */}
      <SimpleModal
        open={showImageListErrorModal}
        message="이미지 목록을 불러오지 못했습니다. 다시 시도해 주세요."
        onClose={() => setShowImageListErrorModal(false)}
      />

      {/* Error Modal (게시글 전송) */}
      <SimpleModal
        open={showErrorModal}
        message="전송에 실패했습니다. 잠시 후 다시 시도해주세요."
        onClose={() => setShowErrorModal(false)}
      />

      {/* 작성 중 나가기 모달 */}
      <SimpleModal
        open={showLeaveModal}
        message={'작성한 내용은 저장되지 않아요.\n게시글 작성을 그만할까요?'}
        leftButtonText="계속하기"
        rightButtonText="그만하기"
        onLeftClick={() => setShowLeaveModal(false)}
        onRightClick={() => navigate('/posts')}
      />
    </div>
  );
}

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
        0.9,
      );
    };
    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
