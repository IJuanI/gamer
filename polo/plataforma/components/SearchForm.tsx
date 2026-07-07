"use client";

import { useCallback, useRef, useState, useEffect } from "react";

export function SearchForm({ initialValue = "" }: { initialValue?: string }) {
  const [query, setQuery] = useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (formRef.current) {
        const formData = new FormData(formRef.current);
        const q = formData.get("q") as string;
        const url = q ? `?q=${encodeURIComponent(q)}` : "?";
        window.location.href = url;
      }
    }, 300);
  }, []);

  return (
    <form ref={formRef} className="flex gap-2" method="GET" action="">
      <input
        name="q"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (formRef.current) {
              const formData = new FormData(formRef.current);
              const q = formData.get("q") as string;
              const url = q ? `?q=${encodeURIComponent(q)}` : "?";
              window.location.href = url;
            }
          }
        }}
        placeholder="Buscar por nombre o sector…"
        className="w-full rounded-lg border border-slate-300 px-3 py-2"
      />
      <button
        type="submit"
        className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
      >
        Buscar
      </button>
    </form>
  );
}
