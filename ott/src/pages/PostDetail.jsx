import React, { useState } from 'react';
import TopBar from '@/components/common/TopBar';

// 더미 데이터
const dummyPost = {
  postId: 154,
  title: 'AI 책상 후기',
  content: 'AI로 생성한 이미지로 책상을 꾸며봤어요!',
  postType: 'AI_RECOMMEND', // 또는 "FREE"
  author: {
    nickname: 'junsik',
    profileImageUrl: 'https://example.com/profile.png',
  },
  likeCount: 12,
  commentCount: 2,
  scrapped: true,
  liked: false,
  isOwner: true,
  imageUrls: ['https://cdn.example.com/ai/1.png', 'https://cdn.example.com/ai/2.png'],
  createdAt: '2025-04-22T01:00:00Z',
};

const dummyComments = [
  {
    commentId: 87,
    content: '책상이 진짜 예쁘네요!',
    author: {
      nickname: 'jun',
      profileImageUrl: 'https://cdn...',
    },
    createdAt: '2025-04-22T00:00:00Z',
    isOwner: false,
  },
  {
    commentId: 88,
    content: '저도 AI로 꾸며보고 싶어요!',
    author: {
      nickname: 'junsik',
      profileImageUrl: 'https://cdn...',
    },
    createdAt: '2025-04-22T00:10:00Z',
    isOwner: true,
  },
];

// 날짜 포맷 함수 (간단 버전)
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function PostDetail() {
  const [post, setPost] = useState(dummyPost);
  const [comments, setComments] = useState(dummyComments);
  const [commentInput, setCommentInput] = useState('');

  // 댓글 등록 함수 예시
  const handleCommentSubmit = () => {
    if (commentInput.trim().length === 0) return;
    // 실제 등록 로직 추가
    // setComments([...comments, ...]);
    setCommentInput('');
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white pb-24 relative">
      {/* 배경 오버레이 (640px 이상일 때 회색 배경) */}
      <div className="fixed inset-0 bg-gray-100 -z-10 hidden sm:block" />
      <TopBar title="게시글 상세" showBackButton />

      {/* 작성자 정보 */}
      <div className="flex items-center px-4 pt-4">
        <img
          src={post.author.profileImageUrl}
          alt="profile"
          className="w-[45px] h-[45px] rounded-full object-cover"
        />
        <div className="ml-3 flex-1">
          <div className="font-bold">{post.author.nickname}</div>
          <div className="text-xs text-gray-400">{formatDate(post.createdAt)}</div>
        </div>
        {post.isOwner && (
          <div className="flex gap-2">
            <button className="text-gray-400 text-sm">수정</button>
            <button className="text-red-500 text-sm">삭제</button>
          </div>
        )}
      </div>

      {/* 제목, 좋아요, 스크랩 */}
      <div className="flex items-center px-4 mt-4">
        <div className="font-bold text-xl flex-1">{post.title}</div>
        <button className="flex items-center mr-2">
          {post.liked ? (
            <svg width="24" height="24" fill="#ff3b30" stroke="#ff3b30" viewBox="0 0 24 24">
              <path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 3 9.5 3C11.24 3 12 4.5 12 4.5C12 4.5 12.76 3 14.5 3C17.5 3 20 5.5 20 8.5C20 13.5 12 21 12 21Z" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="#ff3b30"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 3 9.5 3C11.24 3 12 4.5 12 4.5C12 4.5 12.76 3 14.5 3C17.5 3 20 5.5 20 8.5C20 13.5 12 21 12 21Z" />
            </svg>
          )}
          <span className="ml-1">{post.likeCount}</span>
        </button>
        <button>
          {post.scrapped ? (
            <svg className="w-6 h-6" fill="#2563eb" stroke="#2563eb" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* 이미지 영역 */}
      {post.postType === 'AI_RECOMMEND' ? (
        <div className="flex gap-4 px-4 mt-6">
          <div className="flex-1 flex flex-col items-center">
            <div className="font-bold mb-1">Before</div>
            <div className="w-[120px] h-[120px] bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              {post.imageUrls[0] ? (
                <img src={post.imageUrls[0]} alt="before" className="object-cover w-full h-full" />
              ) : (
                <span className="text-gray-400">이미지</span>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="font-bold mb-1">After</div>
            <div className="w-[120px] h-[120px] bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              {post.imageUrls[1] ? (
                <img src={post.imageUrls[1]} alt="after" className="object-cover w-full h-full" />
              ) : (
                <span className="text-gray-400">이미지</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        // FREE 타입일 때 이미지 미리보기 UI (PostEditor.jsx 참고)
        <div className="px-4 mt-6">
          <div className="flex gap-2">
            {post.imageUrls.map((url, idx) => (
              <div
                key={idx}
                className="w-[120px] h-[120px] bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden"
              >
                <img src={url} alt={`img${idx}`} className="object-cover w-full h-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 본문 */}
      <div className="px-4 mt-6 text-base whitespace-pre-line">{post.content}</div>

      {/* 댓글 영역 */}
      <div className="px-4 mt-8">
        <div className="font-bold mb-2">{post.commentCount}개의 댓글</div>
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.commentId} className="flex items-start gap-2">
              <img
                src={c.author.profileImageUrl}
                alt="profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-semibold text-sm">{c.author.nickname}</span>
                    <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                  </div>
                  {c.isOwner && (
                    <div className="flex gap-2">
                      <button className="text-gray-400 text-xs">수정</button>
                      <button className="text-red-500 text-xs">삭제</button>
                    </div>
                  )}
                </div>
                <div className="text-sm mt-1">{c.content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 댓글 입력창 (fixed) */}
      <div
        className="fixed bottom-3 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t px-4 py-2 flex items-center"
        style={{ zIndex: 50 }}
      >
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2 text-sm outline-none"
          placeholder="댓글을 입력해주세요."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          maxLength={500}
        />
        <button
          className={`ml-2 px-4 py-2 rounded font-semibold transition
            ${
              commentInput.trim().length > 0
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
          disabled={commentInput.trim().length === 0}
          onClick={handleCommentSubmit}
        >
          등록
        </button>
      </div>
    </div>
  );
}
