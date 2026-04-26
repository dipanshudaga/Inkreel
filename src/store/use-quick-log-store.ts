import { create } from "zustand";

interface QuickLogStore {
  isOpen: boolean;
  mediaId: string | null;
  openQuickLog: (mediaId?: string) => void;
  closeQuickLog: () => void;
}

export const useQuickLogStore = create<QuickLogStore>((set) => ({
  isOpen: false,
  mediaId: null,
  openQuickLog: (mediaId) => set({ isOpen: true, mediaId: mediaId || null }),
  closeQuickLog: () => set({ isOpen: false, mediaId: null }),
}));
