import Link from "next/link";

export function QuickAction({ href, icon: Icon, label }) {
  return (
    <Link
      href={href}
      className="flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-zinc-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold/15 text-gold">
        <Icon size={22} />
      </span>
      <span className="max-w-full text-sm font-bold text-navy">{label}</span>
    </Link>
  );
}
