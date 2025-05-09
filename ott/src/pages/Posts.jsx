import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const dummyApiResponse = {
  status: 200,
  message: '게시글 목록 조회 성공',
  data: {
    posts: Array.from({ length: 15 }).map((_, i) => ({
      postId: 154 - i,
      title: `AI 책상 후기 ${i + 1}`,
      author: {
        nickname: 'junsik',
        profileImageUrl: 'https://example.com/profile.png',
      },
      likeCount: 12 + i,
      commentCount: 3 + i,
      createdAt: '2025-05-09T09:00:00Z',
      liked: i % 2 === 0,
      scrapped: i % 3 === 0,
    })),
    pagination: {
      size: 10,
      lastPostId: 145,
      hasNext: true,
    },
  },
};

const CATEGORY_MAP = [
  { label: '전체', value: 'ALL' },
  { label: 'AI추천', value: 'AI_RECOMMEND' },
  { label: '자유', value: 'FREE' },
];
const SORT_MAP = [
  { label: '최신순', value: 'LATEST' },
  { label: '조회수순', value: 'VIEW' },
  { label: '좋아요순', value: 'LIKE' },
  { label: '스크랩순', value: 'SCRAP' },
];

function formatDate(dateString) {
  // UTC → KST 변환
  const date = new Date(dateString);
  const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

  const now = new Date();
  const nowKst = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  const diffMs = nowKst - kstDate;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;

  const yyyy = kstDate.getFullYear();
  const MM = String(kstDate.getMonth() + 1).padStart(2, '0');
  const dd = String(kstDate.getDate()).padStart(2, '0');
  const HH = String(kstDate.getHours()).padStart(2, '0');
  const mm = String(kstDate.getMinutes()).padStart(2, '0');
  return `${yyyy}년 ${MM}월 ${dd}일 ${HH}:${mm}`;
}

export default function Posts() {
  const navigate = useNavigate();
  const [sort, setSort] = useState('LATEST');
  const [category, setCategory] = useState('ALL');
  const [posts, setPosts] = useState(dummyApiResponse.data.posts);
  const [showMiniWrite, setShowMiniWrite] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowMiniWrite(scrollY > 200); // 200px 이상 스크롤 시 +만 보이게
      setShowScrollTop(scrollY > 200); // 200px 이상 스크롤 시 ↑ 버튼 보이게
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 스크랩 토글
  const handleScrap = (id) => {
    setPosts((prev) =>
      prev.map((post) => (post.postId === id ? { ...post, scrapped: !post.scrapped } : post)),
    );
  };

  // 좋아요 토글
  const handleLike = (id) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.postId === id
          ? {
              ...post,
              liked: !post.liked,
              likeCount: post.liked ? post.likeCount - 1 : post.likeCount + 1,
            }
          : post,
      ),
    );
  };

  // 최상단 이동
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white pb-24">
      {/* 카테고리/정렬 */}
      <div className="flex items-center px-4 pt-4 gap-2">
        {CATEGORY_MAP.map((cat) => (
          <button
            key={cat.value}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${category === cat.value ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
        <div className="ml-auto">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_MAP.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 게시글 리스트 */}
      <div className="px-4 pt-4 space-y-6">
        {posts.map((post) => (
          <div
            key={post.postId}
            className="bg-white rounded-xl shadow-sm border p-4 cursor-pointer"
            onClick={() => navigate(`/posts/${post.postId}`)}
          >
            {/* After 이미지 */}
            <div className="relative w-full h-[140px] bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
              {/* 실제 이미지가 있으면 <img src={post.afterImage} ... /> */}
              <span className="text-gray-400">이미지</span>
              {/* 스크랩 버튼 */}
              <button
                className="absolute bottom-2 right-2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleScrap(post.postId);
                }}
              >
                {post.scrapped ? (
                  <svg className="w-5 h-5" fill="#2563eb" stroke="#2563eb" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
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
            {/* 제목 */}
            <div className="font-bold text-base mb-1 truncate">{post.title}</div>
            {/* 날짜/댓글 */}
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <span>{formatDate(post.createdAt)}</span>
              <span className="mx-2">·</span>
              <span>댓글: {post.commentCount}개</span>
            </div>
            {/* 작성자/좋아요 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={post.author.profileImageUrl || 'https://via.placeholder.com/34'}
                  alt="profile"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="text-sm text-gray-700">by {post.author.nickname}</span>
              </div>
              <button
                className="flex items-center gap-1 text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(post.postId);
                }}
              >
                {post.liked ? (
                  <svg
                    width="24"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#ff3b30"
                    stroke="#ff3b30"
                    strokeWidth="2"
                    style={{ transform: 'scale(1.2,1)' }}
                  >
                    <path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 3 9.5 3C11.24 3 12 4.5 12 4.5C12 4.5 12.76 3 14.5 3C17.5 3 20 5.5 20 8.5C20 13.5 12 21 12 21Z" />
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ff3b30"
                    strokeWidth="2"
                    style={{ transform: 'scale(1.2,1)' }}
                  >
                    <path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 3 9.5 3C11.24 3 12 4.5 12 4.5C12 4.5 12.76 3 14.5 3C17.5 3 20 5.5 20 8.5C20 13.5 12 21 12 21Z" />
                  </svg>
                )}
                <span className="text-base">{post.likeCount}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 플로팅 버튼 영역 */}
      <div className="fixed bottom-20 right-4 flex flex-col items-end gap-3 z-50">
        {showScrollTop && (
          <button
            className="mb-1 w-12 h-12 rounded-full bg-white shadow flex items-center justify-center border border-gray-200"
            onClick={handleScrollTop}
          >
            <svg
              width="28"
              height="28"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        )}
        <button
          className={`transition-all duration-200 shadow-lg flex items-center justify-center rounded-full bg-blue-500 text-white font-bold
            ${showMiniWrite ? 'w-14 h-14 text-3xl' : 'px-5 py-3 text-base'}
          `}
          onClick={() => navigate('/post-editor')}
        >
          {showMiniWrite ? '+' : '+ 글쓰기'}
        </button>
      </div>
    </div>
  );
}
