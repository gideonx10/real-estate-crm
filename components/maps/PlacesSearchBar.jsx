"use client";

import { useRef, useState } from "react";
import { MapPin, Search, X } from "lucide-react";
import { usePlacesSearch } from "@/hooks/usePlacesSearch";

export function PlacesSearchBar({ onPlace, placeholder = "Search location..." }) {
  const { suggestions, searching, search, resolvePlace, clear } = usePlacesSearch();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  function handleInput(e) {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) {
      clear();
      setOpen(false);
      return;
    }
    search(val);
    setOpen(true);
  }

  function handleSelect(prediction) {
    setQuery(prediction.description);
    clear();
    setOpen(false);
    resolvePlace(prediction.place_id, onPlace);
  }

  function handleClear() {
    setQuery("");
    clear();
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div className="relative">
      <div className="relative flex items-center">
        {searching ? (
          <span className="pointer-events-none absolute left-3 h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-navy" />
        ) : (
          <Search className="pointer-events-none absolute left-3 text-zinc-400" size={15} />
        )}
        <input
          ref={inputRef}
          value={query}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-9 text-sm font-medium text-zinc-900 outline-none transition focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/10 placeholder:text-zinc-400"
        />
        {query ? (
          <button
            type="button"
            onMouseDown={handleClear}
            className="absolute right-2.5 rounded-md p-0.5 text-zinc-400 hover:text-zinc-600"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {open && suggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-zinc-200">
          {suggestions.map((pred) => (
            <button
              key={pred.place_id}
              type="button"
              onMouseDown={() => handleSelect(pred)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-zinc-50 active:bg-zinc-100"
            >
              <MapPin size={14} className="mt-0.5 shrink-0 text-navy/50" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900">
                  {pred.structured_formatting?.main_text || pred.description}
                </p>
                {pred.structured_formatting?.secondary_text ? (
                  <p className="truncate text-xs text-zinc-500">
                    {pred.structured_formatting.secondary_text}
                  </p>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
