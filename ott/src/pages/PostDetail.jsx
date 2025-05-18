import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '@/components/common/TopBar';
import axiosInstance from '../api/axios';
import axios from 'axios';
import SimpleModal from '@/components/common/SimpleModal';
import CommentBottomSheet from '@/components/common/CommentBottomSheet';
import Toast from '@/components/common/Toast';
import { addLike, removeLike } from '@/api/likes';
import { addScrap, removeScrap } from '@/api/scraps';
import { getConfig } from '@/config/index';

const { BASE_URL } = getConfig();
const axiosBaseInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
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

// 날짜 포맷 함수
function formatDate(dateStr) {
  const createdUTC = new Date(dateStr);
  const date = new Date(createdUTC.getTime() + 9 * 60 * 60 * 1000);
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatCommentDate(createdAtStr) {
  const KST_OFFSET = 9 * 60 * 60 * 1000; // 9시간(ms)
  const now = new Date();
  const createdUTC = new Date(createdAtStr);
  const createdKST = new Date(createdUTC.getTime() + KST_OFFSET);
  const diffMs = now.getTime() - createdKST.getTime();
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
    return `${createdKST.getFullYear()}년 ${pad(createdKST.getMonth() + 1)}월 ${pad(createdKST.getDate())}일 ${pad(createdKST.getHours())}:${pad(createdKST.getMinutes())}`;
  }
}

const formatLikeCount = (count) => {
  if (count < 1000) return count.toString();
  if (count < 10000) return `${Math.floor(count / 1000)}k`;
  if (count < 100000) return `${Math.floor(count / 1000)}k`;
  return `${Math.floor(count / 1000)}k`;
};

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentPageInfo, setCommentPageInfo] = useState({
    size: 10,
    hasNext: false,
    lastCommentId: null,
  });
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteErrorToast, setShowDeleteErrorToast] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [editComment, setEditComment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  // 게시글 정보 불러오기
  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await axiosBaseInstance.get(`/posts/${postId}`);
      setPost(response.data.data);
    } catch (err) {
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 댓글 목록 불러오기
  const fetchComments = async (isFirst = true, lastCommentId = null) => {
    try {
      const params = { size: 10 };
      if (!isFirst && lastCommentId) params.lastCommentId = lastCommentId;
      const res = await axiosInstance.get(`/posts/${postId}/comments`, { params });
      const { comments: newComments, pageInfo } = res.data.data;
      setComments((prev) => (isFirst ? newComments : [...prev, ...newComments]));
      setCommentPageInfo(pageInfo);
    } catch (e) {
      // 에러 처리
    }
  };

  useEffect(() => {
    fetchComments(true);
  }, [postId]);

  useEffect(() => {
    if (!isBottomSheetOpen) {
      fetchComments(true); // 댓글 목록 최신화
    }
  }, [isBottomSheetOpen]);

  // 좋아요 토글 핸들러 추가
  const handleLike = async () => {
    try {
      if (post.liked) {
        await removeLike({ type: 'POST', targetId: post.postId });
      } else {
        await addLike({ type: 'POST', targetId: post.postId });
      }
      setPost((prev) => ({
        ...prev,
        liked: !prev.liked,
        likeCount: prev.liked ? prev.likeCount - 1 : prev.likeCount + 1,
      }));
    } catch {
      setToast('전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setTimeout(() => setToast(''), 1500);
    }
  };

  // 스크랩 토글 핸들러 추가
  const handleScrap = async () => {
    try {
      if (post.scrapped) {
        await removeScrap({ type: 'POST', targetId: post.postId });
        setToast('스크랩이 취소되었어요.');
      } else {
        await addScrap({ type: 'POST', targetId: post.postId });
        setToast('스크랩이 추가되었어요.');
      }
      setPost((prev) => ({
        ...prev,
        scrapped: !prev.scrapped,
      }));
    } catch {
      setToast('전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setTimeout(() => setToast(''), 1500);
    }
  };

  // 댓글 등록 함수 예시
  const handleCommentSubmit = () => {
    if (commentInput.trim().length === 0) return;
    // 실제 등록 로직 추가
    // setComments([...comments, ...]);
    setCommentInput('');
  };

  const handleEdit = () => {
    navigate(`/post-editor?postId=${postId}&mode=edit`);
  };

  // 삭제 핸들러 함수 추가
  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/posts/${postId}`);
      // 삭제 성공 시 목록 페이지로 이동
      navigate('/posts');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      setShowDeleteErrorToast(true);
      // 3초 후 토스트 메시지 숨기기
      setTimeout(() => {
        setShowDeleteErrorToast(false);
      }, 3000);
    }
  };

  const handleEditComment = (comment) => {
    setEditComment(comment);
    setIsBottomSheetOpen(true);
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="max-w-[480px] mx-auto min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // 에러가 있을 때
  if (error) {
    return (
      <div className="max-w-[480px] mx-auto min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate('/posts')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  // 게시글이 없을 때
  if (!post) {
    return null;
  }

  return (
    <div className="max-w-[768px] mx-auto min-h-screen bg-white pb-24 relative">
      {/* 배경 오버레이 (640px 이상일 때 회색 배경) */}
      <div className="fixed inset-0 bg-gray-100 -z-10 hidden sm:block" />
      <TopBar title="게시글 상세" showBack />

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
        {post.owner && (
          <div className="flex gap-2">
            <button className="text-gray-400 text-sm" onClick={handleEdit}>
              수정
            </button>
            <button className="text-red-500 text-sm" onClick={() => setShowDeleteModal(true)}>
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 제목, 좋아요, 스크랩 */}
      <div className="flex items-center px-4 mt-4">
        <div className="font-bold text-xl break-words whitespace-pre-line min-w-0 flex-1">
          {post.title}
        </div>
        <button className="flex items-center mr-2" onClick={handleLike}>
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
          <span className="ml-1">{formatLikeCount(post.likeCount)}</span>
        </button>
        <button onClick={handleScrap}>
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
      {post.imageUrls &&
        post.imageUrls.length > 0 &&
        (post.type === 'AI' ? (
          <div className="flex gap-4 px-4 mt-6">
            <div className="flex-1 flex flex-col items-center">
              <div className="font-bold mb-1">Before</div>
              <div className="min-w-[160px] min-h-[160px] w-full max-w-[300px] aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={post.imageUrls[0].beforeImagePath}
                  alt="before"
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="font-bold mb-1">After</div>
              <div className="min-w-[160px] min-h-[160px] w-full max-w-[300px] aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={post.imageUrls[0].afterImagePath}
                  alt="after"
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col items-center mb-4 px-4 mt-6">
            <div className="relative flex items-center justify-center w-80 h-80 bg-gray-100 rounded-xl overflow-hidden">
              {/* 순서/전체 표기 */}
              <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                {carouselIdx + 1} / {post.imageUrls.length}
              </div>
              {/* 메인 이미지 */}
              <img
                src={post.imageUrls[carouselIdx].imageUuid}
                alt={`이미지 ${carouselIdx + 1}`}
                className="object-contain w-full h-full"
              />
            </div>
            {/* 썸네일 리스트 */}
            <div className="flex gap-2 mt-2">
              {post.imageUrls.map((img, idx) => (
                <img
                  key={idx}
                  src={img.imageUuid}
                  alt={`썸네일 ${idx + 1}`}
                  className={`w-12 h-12 object-cover rounded ${
                    idx === carouselIdx ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setCarouselIdx(idx)}
                />
              ))}
            </div>
          </div>
        ))}

      {/* 본문 */}
      <div className="px-4 mt-6 text-base text-gray-800 mb-4 break-words whitespace-pre-line">
        {post.content}
      </div>

      {/* 댓글 영역 */}
      <div className="px-4 mt-8">
        <div className="font-bold mb-4">{post.commentCount}개의 댓글</div>

        {/* 댓글 목록은 별도 API로 불러오는 것이 좋습니다 */}
        <div className="space-y-4">
          {comments.slice(0, 5).map((c) => (
            <div key={c.commentId} className="flex items-start gap-2">
              <img
                src={c.author.profileImageUrl}
                alt="profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-semibold text-sm">{c.author.nickname}</span>
                    <span className="text-xs text-gray-400">{formatCommentDate(c.createdAt)}</span>
                  </div>
                  {c.owner && (
                    <div className="flex gap-2">
                      <button
                        className="text-gray-400 text-xs"
                        onClick={() =>
                          handleEditComment({ commentId: c.commentId, content: c.content })
                        }
                      >
                        수정
                      </button>
                      <button
                        className="text-red-500 text-xs"
                        onClick={() => {
                          setDeleteTarget({ commentId: c.commentId });
                          setIsDeleteModalOpen(true);
                          fetchPost(true);
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-sm break-words whitespace-pre-line">{c.content}</div>
              </div>
            </div>
          ))}
        </div>
        {/* 전체보기 버튼 또는 안내 문구 */}
        {post.commentCount > 0 ? (
          <button
            className="w-full text-center text-gray-500 py-3 flex items-center justify-center gap-1"
            onClick={() => setIsBottomSheetOpen(true)}
          >
            {post.commentCount}개의 댓글 전체보기
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="inline-block align-middle text-gray-800"
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <div className="w-full text-center text-lg text-black py-3 mt-5">
            첫번째 댓글을 남겨주세요!
          </div>
        )}
      </div>

      {/* 댓글 입력창 */}
      <div className="fixed max-w-[768px] bottom-0 w-full bg-white border-t px-4 py-2 flex items-center">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="댓글을 입력해주세요."
          onFocus={() => setIsBottomSheetOpen(true)}
        />
        <button className="ml-2 px-4 py-2 bg-gray-200 text-gray-400 rounded whitespace-nowrap">
          등록
        </button>
      </div>

      {/* 삭제 확인 모달 */}
      <SimpleModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        message="정말로 삭제하시겠습니까?"
        leftButtonText="취소"
        rightButtonText="삭제"
      />

      {/* 삭제 실패 토스트 */}
      {showDeleteErrorToast && <Toast message="삭제에 실패했습니다. 잠시 후 다시 시도해주세요." />}
      <Toast message={toast} />

      <SimpleModal
        open={isDeleteModalOpen}
        title="댓글 삭제"
        message={`해당 댓글을 삭제하시겠습니까?\n 삭제한 댓글은 되돌릴 수 없습니다.`}
        leftButtonText="취소"
        rightButtonText="삭제"
        onLeftClick={() => setIsDeleteModalOpen(false)}
        onRightClick={async () => {
          try {
            await axiosInstance.delete(`/comments/${deleteTarget.commentId}`);
            setToast('댓글이 삭제되었어요.');
            fetchComments(true);
            fetchPost(true);
          } catch {
            setToast('댓글 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
          } finally {
            setIsDeleteModalOpen(false);
            setTimeout(() => setToast(''), 3000);
          }
        }}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      {/* BottomSheet 컴포넌트 */}
      <CommentBottomSheet
        open={isBottomSheetOpen}
        onClose={() => {
          setIsBottomSheetOpen(false);
          setEditComment(null);
          fetchPost(true);
        }}
        postId={postId}
        editComment={editComment}
        setEditComment={setEditComment}
      />
    </div>
  );
}
