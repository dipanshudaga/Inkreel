"use client";

import { useEffect, useRef } from "react";
import { useMediaStore } from "@/store/use-media-store";

export function StoreInitializer({ items }: { items: any[] }) {
  const initialized = useRef(false);

  if (!initialized.current) {
    const normalizedItems = items.map(item => ({
      ...item,
      updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : (item.updatedAt || new Date(0).toISOString())
    }));
    useMediaStore.getState().setItems(normalizedItems);
    initialized.current = true;
  }

  // Also sync on subsequent loads
  useEffect(() => {
    const normalizedItems = items.map(item => ({
      ...item,
      updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : (item.updatedAt || new Date(0).toISOString())
    }));
    useMediaStore.getState().setItems(normalizedItems);
  }, [items]);

  return null;
}
