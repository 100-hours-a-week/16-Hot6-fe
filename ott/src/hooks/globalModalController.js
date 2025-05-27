let setModalFn = null;

export const setGlobalModal = (setter) => {
  setModalFn = setter;
};
export const triggerGlobalModal = (modalProps) => {
  setModalFn && setModalFn(modalProps);
};
