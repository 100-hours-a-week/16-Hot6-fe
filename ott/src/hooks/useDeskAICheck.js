import axiosInstance from '@/api/axios';
import useImageGenerationStore from '@/store/imageGenerationStore';
import { useState } from 'react';

const MAX_GENERATION_COUNT = 3;

const useDeskAICheck = () => {
  const [modal, setModal] = useState({
    open: false,
    message: '',
    onConfirm: null,
  });

  const [quota, setQuota] = useState(null);
  const status = useImageGenerationStore((state) => state.status);

  const checkDeskAIAvailability = async () => {
    if (status === 'generating') {
      setModal({
        open: true,
        message: '이미지 생성 중입니다. 잠시만 기다려주세요.',
        onConfirm: () => setModal({ open: false, message: '', onConfirm: null }),
      });
      return false;
    }

    try {
      const response = await axiosInstance.get('/ai-images/upload');
      const remainToken = response.data.data.uploadLimitPerDay;
      setQuota(remainToken);

      return true;
    } catch (err) {
      if (err.response?.status === 403) {
        setModal({
          open: true,
          message: `오늘 이미지 생성 횟수(${MAX_GENERATION_COUNT}회)를 모두 소진했습니다.\n내일 다시 시도해주세요.`,
          onConfirm: null,
        });
      }

      return false;
    }
  };

  return { checkDeskAIAvailability, modal, setModal, quota };
};

export default useDeskAICheck;
