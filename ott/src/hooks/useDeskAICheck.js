import axiosInstance from '@/api/axios';
import { useState } from 'react';

const useDeskAICheck = () => {
  const [modal, setModal] = useState({
    open: false,
    message: '',
    onConfirm: null,
  });

  const [quota, setQuota] = useState(null);

  const checkDeskAIAvailability = async () => {
    try {
      console.log('checkDeskAIAvailability 호출됨!');
      const response = await axiosInstance.get('/ai-images/upload');

      console.log('생성 가능 값', response);

      const remainToken = response.data.data.uploadLimitPerDay;
      setQuota(remainToken);

      return true;
    } catch (err) {
      console.log('checkDeskAIAvailability error', err);

      if (err.response?.status === 401) {
        setModal({
          open: true,
          message: '로그인이 필요한 기능입니다.\n로그인 후 다시 시도해주세요.',
          onConfirm: null,
        });
      } else if (err.response?.status === 403) {
        setModal({
          open: true,
          message: `오늘 이미지 생성 횟수(1회)를 모두 소진했습니다.\n내일 다시 시도해주세요.`,
          onConfirm: null,
        });
      }

      return false;
    }
  };

  return { checkDeskAIAvailability, modal, setModal, quota };
};

export default useDeskAICheck;
