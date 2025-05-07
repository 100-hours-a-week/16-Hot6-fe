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
      await axiosInstance.get('/ai-images/upload');
      return true;
    } catch (err) {
      setModal({
        open: true,
        message: '오늘 이미지 생성 횟수를 모두 소진했습니다.\n 내일 다시 시도해주세요.',
        onConfirm: null,
      });
      return false;
    }
  };

  return { checkDeskAIAvailability, modal, setModal };
};

export default useDeskAICheck;
