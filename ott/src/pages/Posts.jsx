import { addLike, removeLike } from '@/api/likes';
import { addScrap, removeScrap } from '@/api/scraps';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getConfig } from '@/config/index';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';

const { BASE_URL } = getConfig();

const CATEGORY_MAP = [
  { label: '전체', value: 'ALL' },
  { label: 'AI추천', value: 'AI' },
  { label: '자유', value: 'FREE' },
];

// 기본 정렬 옵션 (AI 카테고리가 아닐 때)
const BASE_SORT_MAP = [
  { label: '최신순', value: 'LATEST' },
  { label: '조회수순', value: 'VIEW' },
  { label: '좋아요순', value: 'LIKE' },
];

// AI 카테고리용 정렬 옵션 (POPULAR 포함)
const AI_SORT_MAP = [
  { label: '최신순', value: 'LATEST' },
  { label: '인기순', value: 'POPULAR' },
  { label: '조회수순', value: 'VIEW' },
  { label: '좋아요순', value: 'LIKE' },
];

const axiosBaseInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 0,
});

// 요청 인터셉터
axiosBaseInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log('error 인터셉트', error);
    return Promise.reject(error);
  },
);

function formatDate(createdAtStr) {
  const now = new Date();
  const createdDate = new Date(createdAtStr);
  const diffMs = now.getTime() - createdDate.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) {
    return '방금 전';
  } else if (diffMin < 60) {
    return `${diffMin}분 전`;
  } else if (diffHour < 24) {
    return `${diffHour}시간 전`;
  } else if (diffDay < 7) {
    return `${diffDay}일 전`;
  } else {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${createdDate.getFullYear()}년 ${pad(createdDate.getMonth() + 1)}월 ${pad(createdDate.getDate())}일 ${pad(createdDate.getHours())}:${pad(createdDate.getMinutes())}`;
  }
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

export default function Posts() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState(searchParams.get('sort') || 'LATEST');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMiniWrite, setShowMiniWrite] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [pagination, setPagination] = useState({
    lastPostId: null,
    lastLikeCount: null,
    lastViewCount: null,
    lastWeightCount: null,
    hasNext: true,
    size: 10,
  });
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const { toast, setToast } = useOutletContext();

  const windowWidth = useWindowWidth();

  // 게시글 불러오기 함수
  const fetchPosts = async (isFirst = false) => {
    if (isFetching || (!pagination.hasNext && !isFirst)) return;
    setIsFetching(true);
    try {
      const params = {
        category: category !== 'ALL' ? category : undefined,
        sort,
        size: pagination.size,
      };

      // 페이징 처리 (좋아요순, 조회수순, 최신순 구분)
      if (!isFirst) {
        console.log(pagination);
        if (sort === 'LIKE' && pagination.lastLikeCount !== null) {
          params.lastLikeCount = pagination.lastLikeCount;
          params.lastPostId = pagination.lastPostId;
        } else if (sort === 'VIEW' && pagination.lastViewCount !== null) {
          params.lastViewCount = pagination.lastViewCount;
          params.lastPostId = pagination.lastPostId;
        } else if (sort === 'POPULAR' && pagination.lastWeightCount !== null) {
          params.lastWeightCount = pagination.lastWeightCount;
          params.lastPostId = pagination.lastPostId;
        } else {
          params.lastPostId = pagination.lastPostId;
        }
      }

      // API 요청
      const res = await axiosBaseInstance.get('/posts', { params });
      const { posts: newPosts, pagination: newPagination } = res.data.data;

      // 상태 업데이트
      setPosts((prev) => (isFirst ? newPosts : [...prev, ...newPosts]));
      setPagination((prev) => ({
        lastPostId: newPagination.lastPostId,
        lastLikeCount: newPagination.lastLikeCount ?? prev.lastLikeCount,
        lastViewCount: newPagination.lastViewCount ?? prev.lastViewCount,
        lastWeightCount: newPagination.lastWeightCount ?? prev.lastWeightCount,
        hasNext: newPagination.hasNext,
        size: newPagination.size,
      }));

      setError(null);
    } catch (e) {
      setError('게시글 목록을 불러오지 못했습니다.');
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (newCategory) => {
    // 같은 카테고리를 클릭한 경우 아무 동작도 하지 않음
    if (category === newCategory) return;

    setCategory(newCategory);
    setSearchParams((prev) => {
      prev.set('category', newCategory);
      return prev;
    });
    setPosts([]); // 기존 게시글 목록 초기화
    setPagination({
      lastPostId: null,
      lastLikeCount: null,
      lastViewCount: null,
      lastWeightCount: null,
      hasNext: true,
      size: 10,
    });
  };

  // 정렬 변경 핸들러
  const handleSortChange = (newSort) => {
    setSort(newSort);
    setSearchParams((prev) => {
      prev.set('sort', newSort);
      return prev;
    });
    setPosts([]); // 기존 게시글 목록 초기화
    setPagination({
      lastPostId: null,
      lastLikeCount: null,
      lastViewCount: null,
      lastWeightCount: null,
      hasNext: true,
      size: 10,
    });
  };

  // 카테고리나 정렬이 변경될 때마다 새로운 요청
  useEffect(() => {
    fetchPosts(true);
  }, [category, sort]);

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    let isFetchingMore = false;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      lastScrollY = currentScrollY;

      setShowMiniWrite(currentScrollY > 200);
      setShowScrollTop(currentScrollY > 200);

      if (
        isScrollingDown &&
        window.innerHeight + currentScrollY >= document.body.offsetHeight - 200 &&
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

    let timeoutId;
    const debouncedHandleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(handleScroll, 200);
    };

    window.addEventListener('scroll', debouncedHandleScroll);
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [pagination, isFetching, category, sort]);

  // 스크랩 토글
  const handleScrap = async (id) => {
    try {
      const post = posts.find((post) => post.postId === id);
      console.log(post);
      if (post.scrapped) {
        await removeScrap({ type: 'POST', targetId: id });
      } else {
        await addScrap({ type: 'POST', targetId: id });
      }
      setPosts((prev) =>
        prev.map((post) => (post.postId === id ? { ...post, scrapped: !post.scrapped } : post)),
      );
      setToast(post.scrapped ? '스크랩이 취소되었어요.' : '스크랩이 추가되었어요.');
    } catch (err) {
      if (err.response?.status === 401) return;
      setToast('전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setTimeout(() => setToast(''), 1500);
    }
  };

  // 좋아요 토글
  const handleLike = async (id) => {
    try {
      const post = posts.find((post) => post.postId === id);
      if (post.liked) {
        await removeLike({ postId: id });
      } else {
        await addLike({ postId: id });
      }
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
    } catch (err) {
      if (err.response?.status === 401) return;
      setToast('전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setTimeout(() => setToast(''), 1500);
    }
  };

  // 최상단 이동
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  // 첫 진입 시
  useEffect(() => {
    // 액세스 토큰 헬스 체크
    // (async () => {
    //   try {
    //     await axiosInstance.get('/users/me');
    //   } catch (error) {
    //     // 에러가 발생해도 무시
    //     console.error('사용자 정보 요청 실패:', error);
    //   }
    // })();
    fetchPosts(true);
  }, []);

  // useEffect에서 URL 파라미터 변경 감지
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const sortParam = searchParams.get('sort');

    if (categoryParam) setCategory(categoryParam);
    if (sortParam) setSort(sortParam);
  }, [searchParams]);

  // 게시글 클릭 핸들러 수정
  const handlePostClick = (postId) => {
    // 현재 상태를 URL에 저장한 채로 상세 페이지로 이동
    navigate(`/posts/${postId}?category=${category}&sort=${sort}`);
  };

  // 로딩 중일 때
  if (loading) {
    return <LoadingSpinner />;
  }

  // 에러가 있을 때
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white pb-24">
      {/* 카테고리/정렬 */}
      <div className="flex items-center px-4 pt-4 gap-2">
        {CATEGORY_MAP.map((cat) => (
          <button
            key={cat.value}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              category === cat.value ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => handleCategoryChange(cat.value)}
          >
            {cat.label}
          </button>
        ))}
        <div className="ml-auto">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            {category === 'AI'
              ? AI_SORT_MAP.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : BASE_SORT_MAP.map((opt) => (
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
            onClick={() => handlePostClick(post.postId)}
          >
            {/* After 이미지 */}
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
                  src={
                    post.author.profileImage ||
                    'https://play-lh.googleusercontent.com/38AGKCqmbjZ9OuWx4YjssAz3Y0DTWbiM5HB0ove1pNBq_o9mtWfGszjZNxZdwt_vgHo=w480-h960-rw'
                  }
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
      <div
        className="fixed z-50 bottom-24 flex flex-col items-end gap-3"
        style={{
          right: windowWidth >= 768 ? 'calc(50vw - 384px + 1rem)' : '1rem',
          maxWidth: windowWidth >= 768 ? 'calc(100vw - 32px)' : undefined,
        }}
      >
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
