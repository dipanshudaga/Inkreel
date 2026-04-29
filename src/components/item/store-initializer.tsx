"use client";

import { useEffect, useRef } from "react";
import { useMediaStore } from "@/store/use-media-store";

export function StoreInitializer({ items }: { items: any[] }) {
  const initialized = useRef(false);

  // Sync on mount and subsequent loads
  useEffect(() => {
    if (!initialized.current || items) {
      const normalizedItems = items.map(item => ({
        ...item,
        updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : (item.updatedAt || new Date(0).toISOString())
      }));
      useMediaStore.getState().setItems(normalizedItems);
      initialized.current = true;
    }
  }, [items]);

  return null;
}
