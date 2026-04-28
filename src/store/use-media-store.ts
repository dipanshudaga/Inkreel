import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MediaItemState {
  status: string | null;
}

interface MediaStore {
  items: Record<string, MediaItemState>;
  updateItem: (id: string, status: string | null) => void;
  setItems: (items: any[]) => void;
}

export const useMediaStore = create<MediaStore>()(
  persist(
    (set) => ({
      items: {},
      updateItem: (id, status) => {
        set((state) => ({
          items: {
            ...state.items,
            [id]: { status },
          },
        }));
      },
      setItems: (items) => {
        const itemState: Record<string, MediaItemState> = {};
        items.forEach((item) => {
          itemState[item.id] = {
            status: item.status,
          };
        });
        set({ items: itemState });
      },
    }),
    {
      name: "inkreel-media-storage",
    }
  )
);
