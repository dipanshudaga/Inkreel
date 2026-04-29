import { create } from 'zustand';

interface LogModalStore {
  isOpen: boolean;
  media: any;
  onOpen: (media: any) => void;
  onClose: () => void;
}

export const useLogModal = create<LogModalStore>((set) => ({
  isOpen: false,
  media: null,
  onOpen: (media) => set({ isOpen: true, media }),
  onClose: () => set({ isOpen: false, media: null }),
}));
