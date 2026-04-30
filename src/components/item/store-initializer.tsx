"use client";

import { useEffect, useRef } from "react";
import { useMediaStore } from "@/store/use-media-store";

export function StoreInitializer({ items }: { items: any[] }) {
  const initialized = useRef(false);

  // Sync on mount and subsequent loads
  useEffect(() => {
    if (!initialized.current || items) {
      const normalizedItems = items;
      useMediaStore.getState().syncItems(normalizedItems);
      initialized.current = true;
    }
  }, [items]);

  return null;
}
