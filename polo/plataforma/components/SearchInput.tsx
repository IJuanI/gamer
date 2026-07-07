"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function SearchInput({ initialValue = "" }: { initialValue?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setIsPending(true);
        try {
          if (value.trim()) {
            router.push(`?q=${encodeURIComponent(value)}`);
          } else {
            router.push("?");
          }
        } catch (error) {
          console.error("Search error:", error);
          setIsPending(false);
        }
      }, 300);
    },
    [router]
  );

  return (
    <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSearch((e.target as HTMLInputElement).value);
          }
        }}
        placeholder="Buscar por nombre o sector…"
        className="w-full rounded-lg border border-slate-300 px-3 py-2"
      />
      <button
        type="button"
        onClick={() => handleSearch(query)}
        disabled={isPending}
        className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {isPending ? "…" : "Buscar"}
      </button>
    </form>
  );
}
