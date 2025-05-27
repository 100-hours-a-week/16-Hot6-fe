import { createContext, useContext, useEffect, useState } from 'react';
import { setGlobalModal } from './globalModalController';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    open: false,
    message: '',
    leftButtonText: '나중에',
    rightButtonText: '로그인하기',
    onLeftClick: null,
    onRightClick: null,
  });

  useEffect(() => {
    setGlobalModal(setModal);
  }, []);

  return <ModalContext.Provider value={{ modal, setModal }}>{children}</ModalContext.Provider>;
};

const useGlobalModal = () => useContext(ModalContext);
export default useGlobalModal;
