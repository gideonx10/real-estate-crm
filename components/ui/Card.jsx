import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }) {
  return (
    <section
      className={cn("rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm", className)}
      {...props}
    >
      {children}
    </section>
  );
}
