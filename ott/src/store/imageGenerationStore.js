import { create } from 'zustand';

const useImageGenerationStore = create((set) => ({
  imageId: null,
  status: 'idle', // 'idle' | 'generating' | 'done'
  setImageId: (id) => set({ imageId: id, status: 'generating' }),
  setStatus: (status) => set({ status }),
  reset: () => set({ imageId: null, status: 'idle' }),
}));

export default useImageGenerationStore;
