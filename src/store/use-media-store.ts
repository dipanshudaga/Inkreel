import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MediaItemState {
  status: string | null;
  category: "watch" | "read";
}

interface MediaStore {
  items: Record<string, MediaItemState>;
  updateItem: (id: string, status: string | null, category?: "watch" | "read") => void;
  setItems: (items: any[]) => void;
}

export const useMediaStore = create<MediaStore>()(
  persist(
    (set) => ({
      items: {},
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
