// src/pages/PostEditor.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/common/TopBar';
import axios from 'axios';
import SimpleModal from '../components/common/SimpleModal';
import axiosInstance from '@/api/axios';

const categories = [
  { value: 'ai', label: 'AI' },
  { value: 'free', label: '자유' },
];

const dummyAiImageList = [
  {
    aiImageId: 10,
    beforeImagePath: 'https://cdn.yourapp.com/desks/before-101.jpg',
    afterImagePath: 'https://cdn.yourapp.com/desks/after-101.jpg',
    createdAt: '2025-04-22T10:30:00Z',
  },
  {
    aiImageId: 9,
    beforeImagePath: 'https://cdn.yourapp.com/desks/before-100.jpg',
    afterImagePath: 'https://cdn.yourapp.com/desks/after-100.jpg',
    createdAt: '2025-04-18T13:45:00Z',
  },
  {
    aiImageId: 8,
    beforeImagePath: 'https://cdn.yourapp.com/desks/before-100.jpg',
    afterImagePath: 'https://cdn.yourapp.com/desks/after-100.jpg',
    createdAt: '2025-04-18T13:45:00Z',
  },
  {
    aiImageId: 7,
    beforeImagePath: 'https://cdn.yourapp.com/desks/before-100.jpg',
    afterImagePath: 'https://cdn.yourapp.com/desks/after-100.jpg',
    createdAt: '2025-04-18T13:45:00Z',
  },
  {
    aiImageId: 6,
    beforeImagePath: 'https://cdn.yourapp.com/desks/before-100.jpg',
    afterImagePath: 'https://cdn.yourapp.com/desks/after-100.jpg',
    createdAt: '2025-04-18T13:45:00Z',
  },
  {
    aiImageId: 5,
    beforeImagePath: 'https://cdn.yourapp.com/desks/before-100.jpg',
    afterImagePath: 'https://cdn.yourapp.com/desks/after-100.jpg',
    createdAt: '2025-04-18T13:45:00Z',
  },
  {
    aiImageId: 4,
    beforeImagePath: 'https://cdn.yourapp.com/desks/before-100.jpg',
    afterImagePath: 'https://cdn.yourapp.com/desks/after-100.jpg',
    createdAt: '2025-04-18T13:45:00Z',
  },
  {
    aiImageId: 3,
    beforeImagePath: 'https://cdn.yourapp.com/desks/before-100.jpg',
    afterImagePath: 'https://cdn.yourapp.com/desks/after-100.jpg',
    createdAt: '2025-04-18T13:45:00Z',
  },
  {
    aiImageId: 2,
    beforeImagePath: 'https://cdn.yourapp.com/desks/before-100.jpg',
    afterImagePath: 'https://cdn.yourapp.com/desks/after-100.jpg',
    createdAt: '2025-04-18T13:45:00Z',
  },
  {
    aiImageId: 1,
    beforeImagePath: 'https://cdn.yourapp.com/desks/before-100.jpg',
    afterImagePath: 'https://cdn.yourapp.com/desks/after-100.jpg',
    createdAt: '2025-04-18T13:45:00Z',
  },
  {
    aiImageId: 0,
    beforeImagePath: 'https://cdn.yourapp.com/desks/before-100.jpg',
    afterImagePath: 'https://cdn.yourapp.com/desks/after-100.jpg',
    createdAt: '2025-04-18T13:45:00Z',
  },
];

export default function PostEditor() {
  const [category, setCategory] = useState(categories[0].value);
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
  const navigate = useNavigate();

  const beforeInputRef = useRef();
  const afterInputRef = useRef();

  // AI 이미지 목록 불러오기
  useEffect(() => {
    if (category === 'ai' && showImageSheet) {
      axios.get('/api/v1/users/me/desks').then((res) => {
        setAiImageList(res.data.data);
      });
    }
  }, [category, showImageSheet]);

  // 자유 카테고리 이미지 선택
  const fileInputRef = useRef();
  const handleUserImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) setUserImage(file);
  };

  // AI 카테고리 이미지 쌍 선택
  const handleAiImageSelect = (item) => {
    setSelectedAiImageId(item.aiImageId);
    setSelectedAiImage(item);
    setShowImageSheet(false);
  };

  const getImageUrl = (file) => (file ? URL.createObjectURL(file) : null);

  const isTitleValid = title.length >= 2 && title.length <= 35;
  const isContentValid = content.length >= 1 && content.length <= 1000;

  const handleSubmit = async () => {
    if (!isTitleValid || !isContentValid || !selectedAiImageId) return;

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post('/posts/ai', {
        title,
        content,
        aiImageId: selectedAiImageId,
      });

      if (response.status === 201) {
        navigate('/posts');
      }
    } catch (error) {
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[640px] mx-auto min-h-screen bg-white pb-32 relative">
      {/* TopBar */}
      <TopBar title="게시글 작성" showBack onBackClick={() => setShowLeaveModal(true)} />

      <div className="px-4 py-6">
        {/* 카테고리 드롭다운 */}
        <div className="mb-4">
          <label className="block font-bold mb-1">카테고리</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={category}
            onChange={(e) => {
              if (e.target.value === 'free') {
                setShowComingSoonModal(true);
                return;
              }
              setCategory(e.target.value);
              setUserImage(null);
              setSelectedAiImageId(null);
              setSelectedAiImage(null);
            }}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* 이미지 선택 버튼 */}
        {category === 'free' && (
          <button
            className="flex items-center gap-2 border rounded-lg px-4 py-2 bg-gray-100 mb-4"
            onClick={() => setShowComingSoonModal(true)}
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
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleUserImageSelect}
            />
          </button>
        )}

        {/* 자유 카테고리: 이미지 미리보기 */}
        {category === 'free' && userImage && (
          <div className="flex justify-center mb-4">
            <img
              src={URL.createObjectURL(userImage)}
              alt="선택 이미지"
              className="w-40 h-40 object-cover rounded-xl"
            />
          </div>
        )}

        {/* AI 카테고리: 선택된 이미지 쌍 미리보기 */}
        {category === 'ai' && selectedAiImage && (
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
        )}

        {/* AI 카테고리: 이미지 선택 버튼 */}
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

      {/* 작성 완료 버튼 (하단 고정) */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[640px] px-4 pb-6 bg-white z-50">
        <button
          className={`w-full py-3 rounded-lg text-white font-bold text-lg shadow-md transition-colors ${
            isTitleValid && isContentValid && selectedAiImageId && !isSubmitting
              ? 'bg-black hover:bg-gray-800'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
          disabled={!(isTitleValid && isContentValid && selectedAiImageId) || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? '전송 중...' : '작성 완료'}
        </button>
      </div>

      {/* AI 카테고리: 이미지 쌍 선택 BottomSheet */}
      {category === 'ai' && (
        <div
          className={`fixed inset-0 z-50 transition-all duration-300 ease-in-out ${
            showImageSheet ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
          }`}
        >
          <AiImageBottomSheet
            open={showImageSheet}
            onClose={() => setShowImageSheet(false)}
            onSelect={handleAiImageSelect}
          />
        </div>
      )}

      {/* Coming Soon Modal */}
      <SimpleModal
        open={showComingSoonModal}
        message="서비스 준비 중입니다.\n곧 더 나은 모습으로 찾아뵙겠습니다."
        onClose={() => setShowComingSoonModal(false)}
      />

      {/* Error Modal */}
      <SimpleModal
        open={showErrorModal}
        message={`전송에 실패했습니다.\n잠시 후 다시 시도해주세요.`}
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
  const navigate = useNavigate();

  const SHEET_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 700;
  const TOPBAR_HEIGHT = 48;
  const CONTENT_HEIGHT = SHEET_HEIGHT - TOPBAR_HEIGHT;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
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
        <div className="overflow-y-auto h-full px-4 pt-4 pb-20">
          {dummyAiImageList.length > 0 ? (
            <div className="space-y-3">
              {dummyAiImageList.map((item) => (
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
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full -mt-12">
              <p className="text-gray-500 text-center mb-6">
                아직 이용 내역이 없습니다.
                <br />
                다른 서비스를 이용해 보시겠어요?
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
