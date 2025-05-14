import axiosInstance from '@/api/axios';

// 스크랩 추가
export const addScrap = async ({ type, targetId }) => {
  return axiosInstance.post('/scraps', { type, targetId });
};

// 스크랩 취소
export const removeScrap = async ({ type, targetId }) => {
  return axiosInstance.delete('/scraps', {
    data: { type, targetId },
  });
};
