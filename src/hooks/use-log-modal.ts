import { create } from 'zustand';

type Category = "watch" | "read" | "play";

interface LogModalStore {
  isOpen: boolean;
  media: {
    id: string;
    title: string;
    category: Category;
    posterUrl: string;
  } | null;
  onOpen: (media?: LogModalStore['media']) => void;
  onClose: () => void;
}

export const useLogModal = create<LogModalStore>((set) => ({
  isOpen: false,
  media: null,
  onOpen: (media) => set({ isOpen: true, media: media || null }),
  onClose: () => set({ isOpen: false, media: null }),
}));
