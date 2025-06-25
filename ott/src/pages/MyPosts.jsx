import axiosInstance from '@/api/axios';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/common/TopBar';

function formatDate(createdAtStr) {
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  const now = new Date();
  const createdUTC = new Date(createdAtStr);
  const createdKST = new Date(createdUTC.getTime() + KST_OFFSET);
  const diffMs = now.getTime() - createdKST.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  const pad = (n) => n.toString().padStart(2, '0');
  return `${createdKST.getFullYear()}년 ${pad(createdKST.getMonth() + 1)}월 ${pad(createdKST.getDate())}일 ${pad(createdKST.getHours())}:${pad(createdKST.getMinutes())}`;
}

export default function MyPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    lastPostId: null,
    hasNext: true,
    size: 10,
  });

  // 게시글 불러오기
  const fetchPosts = useCallback(
    async (isFirst = false) => {
      if (isFetching || (!pagination.hasNext && !isFirst)) return;
      setIsFetching(true);
      try {
        const params = { size: pagination.size };
        if (!isFirst && pagination.lastPostId) {
          params.cursorId = pagination.lastPostId;
        }
        const res = await axiosInstance.get('/users/me/posts', { params });
        const { posts: newPosts, pagination: newPagination } = res.data.data;
        setPosts((prev) => (isFirst ? newPosts : [...prev, ...newPosts]));
        setPagination({
          lastPostId: newPagination.lastPostId,
          hasNext: newPagination.hasNext,
          size: newPagination.size,
        });
        setError(null);
      } catch {
        setError('게시글 목록을 불러오지 못했습니다.');
      } finally {
        setIsFetching(false);
        setLoading(false);
      }
    },
    [isFetching, pagination],
  );

  // 첫 진입 시
  useEffect(() => {
    fetchPosts(true);
    // eslint-disable-next-line
  }, []);

  // 무한스크롤
  useEffect(() => {
    let isFetchingMore = false;
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        pagination.hasNext &&
        !isFetching &&
        !isFetchingMore
      ) {
        isFetchingMore = true;
        fetchPosts().finally(() => {
          isFetchingMore = false;
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pagination, isFetching, fetchPosts]);

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>
    );

  return (
    <div className="max-w-[768px] mx-auto min-h-screen bg-white pb-24">
      <div className="fixed inset-0 bg-gray-100 -z-10 hidden sm:block" />
      <TopBar title="나의 게시글" showBack />
      <div className="max-w-[480px] mx-auto px-4 pt-4 space-y-6">
        {posts.length === 0 && (
          <div className="text-center text-gray-400 py-20">작성한 게시글이 없습니다.</div>
        )}
        {posts.map((post) => (
          <div
            key={post.postId}
            className="bg-white rounded-xl shadow-sm border p-4 cursor-pointer"
            onClick={() => navigate(`/posts/${post.postId}`)}
          >
            <div className="relative w-full h-[140px] bg-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
              {post.thumbnailUrl ? (
                <img
                  src={post.thumbnailUrl}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">이미지 없음</span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <img
                src={post.author.profileImageUrl || post.author.profileImagePath}
                alt="profile"
                className="w-7 h-7 rounded-full object-cover border"
              />
              <span className="font-semibold text-sm">{post.author.nickname}</span>
              <span className="text-xs text-gray-400 ml-2">{formatDate(post.createdAt)}</span>
            </div>
            <div className="font-bold text-base mb-1 line-clamp-2">{post.title}</div>
            <div className="flex items-center gap-4 text-gray-500 text-sm mt-2">
              <span>좋아요 {post.likeCount}</span>
              <span>댓글 {post.commentCount}</span>
            </div>
          </div>
        ))}
        {isFetching && (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  );
}
