// src/pages/PostEditor.jsx
import React, { useState, useRef, useEffect } from 'react';
import TopBar from '../components/common/TopBar';
import axios from 'axios';

const categories = [
  { value: 'ai', label: 'AI' },
  { value: 'free', label: '자유' },
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

  return (
    <div className="max-w-[640px] mx-auto min-h-screen bg-white pb-32 relative">
      {/* TopBar */}
      <TopBar title="게시글 작성" showBack />

      <div className="px-4 py-6">
        {/* 카테고리 드롭다운 */}
        <div className="mb-4">
          <label className="block font-bold mb-1">카테고리</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={category}
            onChange={(e) => {
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
            onClick={() => fileInputRef.current.click()}
          >
            {/* 일반적인 이미지 아이콘 */}
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
          className={`w-full py-3 rounded-lg text-white font-bold text-lg shadow-md ${isTitleValid && isContentValid ? 'bg-black' : 'bg-gray-300'}`}
          disabled={!(isTitleValid && isContentValid)}
        >
          작성 완료
        </button>
      </div>

      {/* AI 카테고리: 이미지 쌍 선택 BottomSheet */}
      {category === 'ai' && showImageSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* 오버레이 */}
          <div
            className="absolute inset-0 bg-black bg-opacity-30"
            onClick={() => setShowImageSheet(false)}
          />
          {/* BottomSheet */}
          <div className="relative w-full max-w-[640px] bg-white rounded-t-2xl p-4 transition-transform duration-300 translate-y-0">
            <div className="mb-4 text-center font-bold">이미지 선택</div>
            <div className="max-h-[60vh] overflow-y-auto space-y-4">
              {aiImageList.map((item) => (
                <div
                  key={item.aiImageId}
                  className="flex items-center gap-4 border rounded-lg p-2 relative"
                >
                  <img
                    src={item.beforeImagePath}
                    alt="before"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <img
                    src={item.afterImagePath}
                    alt="after"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  {/* 우측 상단 선택 아이콘 */}
                  <button
                    className="absolute top-2 right-2"
                    onClick={() => handleAiImageSelect(item)}
                  >
                    {selectedAiImageId === item.aiImageId ? (
                      <svg
                        className="w-6 h-6 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <circle cx="10" cy="10" r="10" fill="#3b82f6" />
                        <path d="M7 10l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
