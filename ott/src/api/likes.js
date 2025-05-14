import axiosInstance from '@/api/axios';

// 좋아요 추가
export const addLike = async ({ type, targetId }) => {
  return axiosInstance.post('/likes', { type, targetId });
};

// 좋아요 취소
export const removeLike = async ({ type, targetId }) => {
  return axiosInstance.delete('/likes', {
    data: { type, targetId },
  });
};
