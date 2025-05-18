import axiosInstance from '@/api/axios';
import { useState } from 'react';

const useDeskAICheck = () => {
  const [modal, setModal] = useState({
    open: false,
    message: '',
    onConfirm: null,
  });

  const checkDeskAIAvailability = async () => {
    try {
      console.log('checkDeskAIAvailability 호출됨!');
      await axiosInstance.get('/ai-images/upload');
      return true;
    } catch (err) {
      console.log('checkDeskAIAvailability error', err);
      if (err.response.status !== 401) {
        setModal({
          open: true,
          message: '오늘 이미지 생성 횟수(1회)를 모두 소진했습니다.\n 내일 다시 시도해주세요.',
          onConfirm: null,
        });
      }
      return false;
    }
  };

  return { checkDeskAIAvailability, modal, setModal };
};

export default useDeskAICheck;
