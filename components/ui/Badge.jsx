import { cn, statusTone } from "@/lib/utils";

export function Badge({ children, tone, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        tone || statusTone[children] || "border-zinc-200 bg-zinc-100 text-zinc-700",
        className
      )}
    >
      {children}
    </span>
  );
}
