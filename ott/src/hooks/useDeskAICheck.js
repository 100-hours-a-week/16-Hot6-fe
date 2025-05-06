import axiosInstance from '@/api/axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const useDeskAICheck = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState({ open: false, message: '' });

  const handleDeskAICreate = async () => {
    try {
      await axiosInstance.get('/ai-images/upload');
      // 200 OK면 이동
      navigate('/desk');
    } catch (err) {
      setModal({
        open: true,
        message: '오늘 이미지 생성 횟수를 모두 소진했습니다.\n 내일 다시 시도해주세요.',
      });
    }
  };

  return { handleDeskAICreate, modal, setModal };
};

export default useDeskAICheck;
