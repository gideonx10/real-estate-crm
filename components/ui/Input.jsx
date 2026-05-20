import { cn } from "@/lib/utils";

export function Input({ label, className, ...props }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-zinc-700">
      {label ? <span>{label}</span> : null}
      <input
        className={cn(
          "h-12 rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-950 outline-none transition focus:border-navy focus:ring-4 focus:ring-navy/10",
          className
        )}
        {...props}
      />
    </label>
  );
}

export function Textarea({ label, className, ...props }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-zinc-700">
      {label ? <span>{label}</span> : null}
      <textarea
        className={cn(
          "min-h-28 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition focus:border-navy focus:ring-4 focus:ring-navy/10",
          className
        )}
        {...props}
      />
    </label>
  );
}
