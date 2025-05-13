import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopBar from '../components/common/TopBar';
import SimpleModal from '../components/common/SimpleModal';
import axiosInstance from '@/api/axios';
import ImagePreview from '../components/common/ImagePreview';
import LoadingSpinner from '../components/common/LoadingSpinner';

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
  const [content, setContent] = useState('');
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
    if (!isEditMode) {
      setFreeImages([]);
      setCarouselIdx(0);
    }
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
    setCarouselIdx(0);
  };

  // 이미지 삭제
  const handleRemoveImage = (idx) => {
    setFreeImages((prev) => prev.filter((_, i) => i !== idx));
    setCarouselIdx(0);
  };

  const getImageUrl = (file) => (file ? URL.createObjectURL(file) : null);

  const isTitleValid = title.length >= 2 && title.length <= 35;
  const isContentValid = content.length >= 1 && content.length <= 1000;

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
          navigate('/posts');
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
          navigate('/posts');
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
    <div className="max-w-[640px] mx-auto min-h-screen bg-white pb-32 relative">
      {/* 배경 오버레이 (640px 이상일 때 회색 배경) */}
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

        {/* AI 카테고리: 선택된 이미지 쌍 미리보기 */}
        {category === 'ai' && selectedAiImage ? (
          <div className="flex justify-center gap-4 mb-4">
            <img
              src={selectedAiImage.beforeImagePath}
              alt="before"
              className="w-40 h-40 object-cover rounded-xl"
            />
            <img
              src={selectedAiImage.afterImagePath}
              alt="after"
              className="w-40 h-40 object-cover rounded-xl"
            />
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

        {/* AI 이미지 선택 버튼 */}
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

        {/* 제목 입력 */}
        <div className="mb-2">
          <label className="block font-bold mb-1">제목</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-lg"
            placeholder="게시글 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTitleTouched(true)}
            maxLength={35}
          />
          {titleTouched && !isTitleValid && (
            <div className="text-xs text-red-500 mt-1">
              게시글 제목은 2자 이상, 35자 이하만 가능합니다.
            </div>
          )}
        </div>

        {/* 내용 입력 */}
        <div className="mb-2">
          <label className="block font-bold mb-1">내용</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 min-h-[120px] text-base"
            placeholder="게시글 내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => setContentTouched(true)}
            maxLength={1000}
          />
          {contentTouched && !isContentValid && (
            <div className="text-xs text-red-500 mt-1">
              게시글 내용은 1자 이상, 1,000자 이하만 가능합니다.
            </div>
          )}
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
