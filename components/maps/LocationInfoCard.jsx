import { MapPin } from "lucide-react";

export function LocationInfoCard({ address, coords, loading }) {
  return (
    <div className="flex min-h-14 items-start gap-3 border-t border-zinc-100 bg-white px-4 py-3">
      <div className="mt-0.5 shrink-0">
        {loading ? (
          <span className="block h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-navy" />
        ) : (
          <MapPin size={15} className="text-navy" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {address ? (
          <>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Selected Location
            </p>
            <p className="mt-0.5 text-sm font-semibold leading-snug text-zinc-800">{address}</p>
          </>
        ) : (
          <p className="text-sm font-semibold text-zinc-400">
            {coords ? "Resolving address…" : "Drag the map to select a location"}
          </p>
        )}
        {coords ? (
          <p className="mt-1 font-mono text-[11px] text-zinc-400">
            {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
