"use client";

import { Loader2, LocateFixed } from "lucide-react";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";

export function CurrentLocationButton({ onLocation, className = "" }) {
  const { loading, error, requestLocation } = useCurrentLocation();

  return (
    <button
      type="button"
      onClick={() => requestLocation(onLocation)}
      disabled={loading}
      title={error || "Use my current location"}
      aria-label="Use my current location"
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 transition hover:bg-zinc-50 active:scale-95 disabled:opacity-60 ${className}`}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin text-navy" />
      ) : (
        <LocateFixed size={18} className={error ? "text-red-500" : "text-navy"} />
      )}
    </button>
  );
}
