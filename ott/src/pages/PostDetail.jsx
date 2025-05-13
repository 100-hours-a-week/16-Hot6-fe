import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '@/components/common/TopBar';
import axiosInstance from '@/api/axios';
import SimpleModal from '@/components/common/SimpleModal';

// 날짜 포맷 함수
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteErrorToast, setShowDeleteErrorToast] = useState(false);

  // 게시글 정보 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axiosInstance.get(`/posts/${postId}`);
        setPost(response.data.data);
      } catch (err) {
        setError('게시글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  // 좋아요 토글 핸들러 추가
  const handleLike = async (postId) => {
    try {
      // API 호출 로직 추가 필요
      setPost((prev) => ({
        ...prev,
        liked: !prev.liked,
        likeCount: prev.liked ? prev.likeCount - 1 : prev.likeCount + 1,
      }));
    } catch (error) {
      console.error('좋아요 처리 중 오류 발생:', error);
    }
  };

  // 스크랩 토글 핸들러 추가
  const handleScrap = async (postId) => {
    try {
      // API 호출 로직 추가 필요
      setPost((prev) => ({
        ...prev,
        scrapped: !prev.scrapped,
      }));
    } catch (error) {
      console.error('스크랩 처리 중 오류 발생:', error);
    }
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
        <div className="font-bold text-xl flex-1">{post.title}</div>
        <button
          className="flex items-center mr-2"
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
          <span className="ml-1">{post.likeCount}</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleScrap(post.postId);
          }}
        >
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
      <div className="px-4 mt-6 text-base whitespace-pre-line">{post.content}</div>

      {/* 댓글 영역 */}
      <div className="px-4 mt-8">
        <div className="font-bold mb-2">{post.commentCount}개의 댓글</div>
        {/* 댓글 목록은 별도 API로 불러오는 것이 좋습니다 */}
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
      {showDeleteErrorToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
          삭제에 실패했습니다. 잠시 후 다시 시도해주세요.
        </div>
      )}
    </div>
  );
}
