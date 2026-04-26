import { create } from "zustand";

interface SearchStore {
  isOpen: boolean;
  query: string;
  open: () => void;
  close: () => void;
  setQuery: (query: string) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  query: "",
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, query: "" }),
  setQuery: (query) => set({ query }),
}));
