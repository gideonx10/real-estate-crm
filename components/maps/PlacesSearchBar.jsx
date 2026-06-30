"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { AlertCircle, MapPin, Search, X } from "lucide-react";
import { usePlacesSearch } from "@/hooks/usePlacesSearch";
import { extractCoordsFromUrl, isMapsUrl, isShortMapsUrl, parseMapsUrl } from "@/lib/maps/parseMapsUrl";

export const PlacesSearchBar = forwardRef(function PlacesSearchBar(
  {
    onPlace,
    placeholder = "Search location, address or paste a Google Maps link…",
  },
  ref
) {
  const { suggestions, searching, search, resolvePlace, clear } = usePlacesSearch();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [urlProcessing, setUrlProcessing] = useState(false);
  const [urlError, setUrlError] = useState(false);
  const inputRef = useRef(null);

  // Resolve a short Maps URL via the server-side API, then extract coords
  async function resolveShortUrl(url) {
    const res = await fetch(
      `/api/resolve-maps-url?url=${encodeURIComponent(url)}`
    );
    if (!res.ok) throw new Error("resolution failed");
    const { resolvedUrl } = await res.json();
    if (!resolvedUrl) throw new Error("no resolved url");
    const coords = extractCoordsFromUrl(resolvedUrl);
    if (!coords) throw new Error("no coords in resolved url");
    return coords;
  }

  // Core processing logic — handles both URL and plain text input
  async function processInput(val) {
    setQuery(val);
    clear();
    setOpen(false);
    setUrlError(false);

    if (!val.trim()) return;

    const parsed = parseMapsUrl(val);

    if (parsed) {
      // It's a Maps URL — process accordingly
      setUrlProcessing(true);
      try {
        if (parsed.type === "coords") {
          setQuery(""); // clear input; info card will show the result
          onPlace({ latitude: parsed.latitude, longitude: parsed.longitude });
        } else if (parsed.type === "short") {
          const coords = await resolveShortUrl(parsed.url);
          setQuery("");
          onPlace(coords);
        } else if (parsed.type === "text") {
          // Place-name extracted from URL — hand off to Places autocomplete
          setQuery(parsed.query);
          search(parsed.query);
          setOpen(true);
        }
      } catch {
        setUrlError(true);
        setTimeout(() => setUrlError(false), 3000);
      } finally {
        setUrlProcessing(false);
      }
      return;
    }

    // Plain text — normal autocomplete
    search(val);
    setOpen(true);
  }

  function handleInput(e) {
    processInput(e.target.value);
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
    setUrlError(false);
    inputRef.current?.focus();
  }

  // Exposed to parent via ref — used by the clipboard paste button
  const processInputRef = useRef(processInput);
  processInputRef.current = processInput;

  useImperativeHandle(ref, () => ({
    processInput: (text) => processInputRef.current(text),
  }));

  const isUrl = isMapsUrl(query);
  const showSpinner = searching || urlProcessing;

  return (
    <div className="relative">
      <div className="relative flex items-center">
        {showSpinner ? (
          <span className="pointer-events-none absolute left-3 h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-navy" />
        ) : urlError ? (
          <AlertCircle
            size={15}
            className="pointer-events-none absolute left-3 text-red-400"
          />
        ) : (
          <Search className="pointer-events-none absolute left-3 text-zinc-400" size={15} />
        )}
        <input
          ref={inputRef}
          value={query}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && !isUrl && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className={`h-10 w-full rounded-xl border bg-zinc-50 pl-9 pr-9 text-sm font-medium text-zinc-900 outline-none transition focus:bg-white focus:ring-2 placeholder:text-zinc-400 ${
            urlError
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-zinc-200 focus:border-navy focus:ring-navy/10"
          }`}
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

      {urlError ? (
        <p className="mt-1 px-1 text-xs font-semibold text-red-500">
          Could not resolve this link. Try a full Google Maps URL or search by name.
        </p>
      ) : null}

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
});
