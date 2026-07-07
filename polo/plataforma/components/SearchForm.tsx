"use client";

import { useCallback, useRef, useState } from "react";

export function SearchForm({ initialValue = "" }: { initialValue?: string }) {
  const [query, setQuery] = useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (formRef.current) {
        formRef.current.submit();
      }
    }, 300);
  }, []);

  return (
    <form ref={formRef} className="flex gap-2" method="GET">
      <input
        ref={inputRef}
        name="q"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Buscar por nombre o sector…"
        className="w-full rounded-lg border border-slate-300 px-3 py-2"
      />
      <button className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600">
        Buscar
      </button>
    </form>
  );
}
