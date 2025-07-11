import SimpleModal from '@/components/common/SimpleModal';
import useGlobalModal from '@/hooks/useGlobalModal';
import { useLocation, useNavigate } from 'react-router-dom';

const LoginModal = () => {
  const { modal, setModal } = useGlobalModal();
  const navigate = useNavigate();
  const location = useLocation();

  if (!modal.open) return null;

  // 로그인 필요 모달만 보여주는 용도로 사용!
  return (
    <SimpleModal
      open={modal.open}
      message="로그인 후 다시 시도해주세요."
      rightButtonText="로그인하기"
      onRightClick={() => {
        setModal({ ...modal, open: false });
        // 현재 페이지 URL을 쿼리 파라미터로 전달
        const currentPath = location.pathname + location.search;
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }}
      onClose={() => setModal({ ...modal, open: false })}
    />
  );
};

export default LoginModal;
