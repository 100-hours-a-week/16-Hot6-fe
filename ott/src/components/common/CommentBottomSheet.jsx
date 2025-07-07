import axiosInstance from '@/api/axios';
import SimpleModal from '@/components/common/SimpleModal';
import Toast from '@/components/common/Toast';
import { triggerGlobalModal } from '@/hooks/globalModalController';
import { useEffect, useRef, useState } from 'react';

function formatCommentDate(createdAtStr) {
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

export default function CommentBottomSheet({ open, onClose, postId, editComment, setEditComment }) {
  const [comments, setComments] = useState([]);
  const [pageInfo, setPageInfo] = useState({ size: 10, hasNext: false, lastCommentId: null });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();
  const [commentInput, setCommentInput] = useState('');
  const [prevContent, setPrevContent] = useState('');
  const [toast, setToast] = useState('');
  const sheetRef = useRef();
  const [startY, setStartY] = useState(null);
  const [translateY, setTranslateY] = useState(0);
  const scrollRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // BottomSheet가 열릴 때마다 댓글 불러오기
  useEffect(() => {
    if (open) fetchComments(true);
  }, [open, postId]);

  // 수정 모드 진입 시 input에 값 세팅 및 포커스
  useEffect(() => {
    if (editComment) {
      setCommentInput(editComment.content);
      setPrevContent(editComment.content);
      if (inputRef.current) inputRef.current.focus();
    }
  }, [editComment, open]);

  // 무한 스크롤
  const fetchComments = async (isFirst = false) => {
    if (loading || (!isFirst && !pageInfo.hasNext)) return;
    setLoading(true);
    try {
      const params = { size: isFirst ? 20 : 10 };
      if (!isFirst && pageInfo.lastCommentId) params.lastCommentId = pageInfo.lastCommentId;
      const res = await axiosInstance.get(`/posts/${postId}/comments`, { params });
      const { comments: newComments, pageInfo: newPageInfo } = res.data.data;
      setComments((prev) => (isFirst ? newComments : [...prev, ...newComments]));
      setPageInfo(newPageInfo);
    } catch (e) {
      // 에러 처리
    } finally {
      setLoading(false);
    }
  };

  // 스크롤 하단 감지
  const handleScroll = (e) => {
    if (!pageInfo.hasNext || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      fetchComments(false);
    }
  };

  // 댓글 수정 버튼 클릭 시
  const handleEdit = async () => {
    if (
      !editComment ||
      commentInput === prevContent ||
      commentInput.length === 0 ||
      commentInput.length > 500
    )
      return;
    try {
      await axiosInstance.patch(`/comments/${editComment.commentId}`, {
        content: commentInput,
      });
      setToast('댓글을 수정했습니다.');
      setTimeout(() => setToast(''), 3000);
      setEditComment(null);
      setCommentInput('');
      setPrevContent('');
      fetchComments(true); // 댓글 목록 새로고침
    } catch (e) {
      // 에러 처리
    }
  };

  // 댓글 등록 버튼 활성화 조건
  const isEditMode = !!editComment;
  const isValid =
    commentInput.length > 0 &&
    commentInput.length <= 500 &&
    (!isEditMode || commentInput !== prevContent);

  // 댓글 등록/수정 버튼 클릭 핸들러
  const handleRegisterOrEdit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (isEditMode) {
      await handleEdit();
    } else {
      try {
        await axiosInstance.post(`/posts/${postId}/comments`, {
          content: commentInput,
        });
        setCommentInput('');
        fetchComments(true); // 댓글 목록 새로고침
      } catch (err) {
        if (err.response?.status === 401) {
          // 1. 댓글 작성 BottomSheet 내리기
          if (typeof onClose === 'function') onClose();
          // 2. 로그인 필요 글로벌 모달 띄우기
          triggerGlobalModal({
            open: true,
            message: '로그인이 필요한 기능입니다. 로그인 후 다시 시도해주세요.',
            leftButtonText: '나중에',
            rightButtonText: '로그인하기',
            onLeftClick: () => triggerGlobalModal({ open: false }),
            onRightClick: () => {
              triggerGlobalModal({ open: false });
              window.location.href = '/login';
            },
          });
          setIsSubmitting(false);
          return;
        }
        setTimeout(() => setToast(''), 3000);
      }
    }
    setIsSubmitting(false);
  };

  // 댓글 입력창 포커스
  useEffect(() => {
    if (open && inputRef.current && !editComment) {
      inputRef.current.focus();
    }
  }, [open, editComment]);

  // 댓글 목록에서 수정 버튼 클릭 시
  const handleCommentEditClick = (comment) => {
    setEditComment(comment);
    setCommentInput(comment.content);
    setPrevContent(comment.content);
    if (inputRef.current) inputRef.current.focus();
  };

  // 터치/마우스 시작
  const handleDragStart = (e) => {
    if (scrollRef.current && scrollRef.current.scrollTop > 0) return;
    setIsDragging(true);
    setStartY(e.touches ? e.touches[0].clientY : e.clientY);
  };

  // 터치/마우스 이동
  const handleDragMove = (e) => {
    if (startY === null) return;
    const currentY = e.touches ? e.touches[0].clientY : e.clientY;
    const diff = currentY - startY;
    if (diff > 0) setTranslateY(diff);
  };

  // 터치/마우스 끝
  const handleDragEnd = () => {
    if (translateY > 100) {
      onClose();
    }
    setIsDragging(false);
    setStartY(null);
    setTranslateY(0);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleDragMove = (e) => {
      const currentY = e.touches ? e.touches[0].clientY : e.clientY;
      const diff = currentY - startY;
      if (diff > 0) setTranslateY(diff);
    };

    const handleDragEnd = () => {
      if (translateY > 100) {
        onClose();
      }
      setIsDragging(false);
      setStartY(null);
      setTranslateY(0);
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, startY, translateY, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end items-center">
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose}></div>
      {/* BottomSheet */}
      <div
        ref={sheetRef}
        className="relative bg-white rounded-t-2xl max-h-[80vh] w-full max-w-[768px] flex flex-col animate-slideup"
        style={{ transform: `translateY(${translateY}px)` }}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={startY !== null ? handleDragMove : undefined}
        onMouseUp={handleDragEnd}
      >
        <div
          className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-2 cursor-pointer"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        />
        <div
          ref={scrollRef}
          className="overflow-y-auto max-h-[60vh] flex-1 px-4"
          style={{ minHeight: 200, maxHeight: '60vh' }}
          onScroll={handleScroll}
          onWheel={(e) => e.stopPropagation()}
        >
          {comments.length === 0 ? (
            <div className="text-center py-8">첫번째 댓글을 남겨주세요!</div>
          ) : (
            comments.map((c) => (
              <div key={c.commentId} className="flex items-start gap-2 py-2">
                <img
                  src={c.author.profileImageUrl}
                  alt="profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-semibold text-sm">{c.author.nickname}</span>
                      <span className="text-xs text-gray-400">
                        {formatCommentDate(c.createdAt)}
                      </span>
                    </div>
                    {c.owner && (
                      <div className="flex gap-2">
                        <button
                          className="text-gray-400 text-xs"
                          onClick={() =>
                            handleCommentEditClick({ commentId: c.commentId, content: c.content })
                          }
                        >
                          수정
                        </button>
                        <button
                          className="text-red-500 text-xs"
                          onClick={() => {
                            setDeleteTarget({ commentId: c.commentId });
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-sm mt-1 break-words whitespace-pre-line">{c.content}</div>
                </div>
              </div>
            ))
          )}
          {loading && <div className="text-center py-2 text-gray-400">불러오는 중...</div>}
        </div>
        {/* 댓글 입력창 */}
        <div className="border-t px-4 py-2 flex items-center gap-2">
          <input
            ref={inputRef}
            className="flex-1 min-w-0 border rounded px-3 py-2 focus:border-blue-500 outline-none"
            placeholder="댓글을 입력해주세요."
            value={commentInput}
            onChange={(e) => {
              if (e.target.value.length <= 500) setCommentInput(e.target.value);
            }}
            maxLength={500}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && isValid) {
                e.preventDefault();
                handleRegisterOrEdit();
              }
            }}
          />
          <button
            className={`shrink-0 px-4 py-2 rounded font-semibold transition whitespace-nowrap
              ${isValid ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            disabled={!isValid}
            onClick={handleRegisterOrEdit}
            type="button"
          >
            {isEditMode ? '수정' : '등록'}
          </button>
        </div>
      </div>
      <Toast message={toast} />
      <SimpleModal
        open={isDeleteModalOpen}
        title="댓글 삭제"
        message="해당 댓글을 삭제하시겠습니까? 삭제한 댓글은 되돌릴 수 없습니다."
        leftButtonText="취소"
        rightButtonText="삭제"
        onLeftClick={() => setIsDeleteModalOpen(false)}
        onRightClick={async () => {
          try {
            await axiosInstance.delete(`/comments/${deleteTarget.commentId}`);
            setToast('댓글이 삭제되었어요.');
            fetchComments(true);
          } catch {
            setToast('댓글 삭제에 실패했어요. 잠시 후 다시 시도해주세요.');
          } finally {
            setIsDeleteModalOpen(false);
            setTimeout(() => setToast(''), 3000);
          }
        }}
        onClose={() => setIsDeleteModalOpen(false)}
      />
      {/* slideUp 애니메이션은 tailwind 또는 css로 추가 */}
    </div>
  );
}
