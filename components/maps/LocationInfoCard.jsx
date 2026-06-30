import { MapPin, ShieldCheck } from "lucide-react";

export function LocationInfoCard({ address, placeName, coords, loading, verified }) {
  const hasContent = loading || address || coords;

  if (!hasContent) {
    return (
      <div className="flex min-h-14 items-center gap-3 border-t border-zinc-100 bg-white px-4 py-3">
        <MapPin size={15} className="shrink-0 text-zinc-300" />
        <p className="text-sm font-semibold text-zinc-400">
          Drag the map to select a location
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-14 items-start gap-3 border-t border-zinc-100 bg-white px-4 py-3">
      <div className="mt-0.5 shrink-0">
        {loading ? (
          <span className="block h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-navy" />
        ) : (
          <MapPin size={15} className={verified ? "text-navy" : "text-zinc-400"} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        {loading ? (
          <p className="animate-pulse text-sm font-semibold text-zinc-400">
            Finding address…
          </p>
        ) : address ? (
          <>
            {placeName ? (
              <p className="font-bold leading-tight text-zinc-900">{placeName}</p>
            ) : null}
            <p
              className={`text-sm font-semibold leading-snug ${
                placeName ? "mt-0.5 text-zinc-500" : "text-zinc-800"
              }`}
            >
              {address}
            </p>
            {verified ? (
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-success">
                <ShieldCheck size={11} />
                Location Verified
              </span>
            ) : null}
          </>
        ) : null}

        {coords && !loading ? (
          <p className="mt-1 font-mono text-[11px] text-zinc-400">
            {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
