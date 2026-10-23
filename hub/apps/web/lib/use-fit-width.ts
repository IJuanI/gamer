"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Tracks the rendered width of an element, capped at `max`. Previews use it to fit small screens
 * instead of overflowing them.
 */
export function useFitWidth<T extends HTMLElement>(max: number): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(max);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(0, Math.min(max, Math.floor(entry.contentRect.width))));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [max]);

  return [ref, width];
}
