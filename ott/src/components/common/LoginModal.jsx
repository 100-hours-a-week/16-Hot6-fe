import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleModal from './SimpleModal';

const LoginModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleLoginRequired = (event) => {
      setMessage(event.detail.message);
      setRedirectUrl(event.detail.redirectUrl);
      setIsOpen(true);
    };

    window.addEventListener('loginRequired', handleLoginRequired);
    return () => window.removeEventListener('loginRequired', handleLoginRequired);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // 로그인 페이지로 이동하면서 현재 페이지 URL을 state로 전달
    navigate('/login', { state: { from: redirectUrl } });
  };

  return (
    <SimpleModal
      open={isOpen}
      message={message}
      onClose={handleClose}
      showCancel={true}
      confirmText="로그인하기"
      cancelText="나중에"
    />
  );
};

export default LoginModal;
