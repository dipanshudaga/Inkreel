import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MediaItemState {
  status: string | null;
  category: "watch" | "read";
}

interface MediaStore {
  items: Record<string, MediaItemState>;
  user: { name: string | null; username: string | null } | null;
  updateItem: (id: string, status: string | null, category?: "watch" | "read") => void;
  removeItem: (id: string) => void;
  syncItems: (items: any[]) => void;
  setItems: (items: any[]) => void;
  setUser: (user: { name: string | null; username: string | null } | null) => void;
}

export const useMediaStore = create<MediaStore>()(
  persist(
    (set) => ({
      items: {},
      user: null,
      setUser: (user) => set({ user }),
      updateItem: (id, status, category) => {
        set((state) => {
          const existing = state.items[id];
          const finalCategory = category || existing?.category || "watch";
          
          return {
            items: {
              ...state.items,
              [id]: { status, category: finalCategory },
            },
          };
        });
      },
      removeItem: (id) => {
        set((state) => {
          const newItems = { ...state.items };
          delete newItems[id];
          return { items: newItems };
        });
      },
      syncItems: (newItems) => {
        if (!Array.isArray(newItems)) return;
        set((state) => {
          const updatedItems = { ...state.items };
          newItems.forEach((item) => {
            updatedItems[item.id || item.externalId] = {
              status: item.status,
              category: item.category as "watch" | "read",
            };
          });
          return { items: updatedItems };
        });
      },
      setItems: (newItems) => {
        if (!Array.isArray(newItems)) return;
        set(() => {
          const updatedItems: Record<string, MediaItemState> = {};
          newItems.forEach((item) => {
            updatedItems[item.id || item.externalId] = {
              status: item.status,
              category: item.category as "watch" | "read",
            };
          });
          return { items: updatedItems };
        });
      },
    }),
    {
      name: "inkreel-media-storage",
    }
  )
);
