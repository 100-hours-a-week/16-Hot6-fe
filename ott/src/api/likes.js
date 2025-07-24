import axiosInstance from '@/api/axios';

// 좋아요 추가
export const addLike = async ({ postId }) => {
  return axiosInstance.post('/likes', { postId });
};

// 좋아요 취소
export const removeLike = async ({ postId }) => {
  return axiosInstance.post('/likes', { postId });
};
