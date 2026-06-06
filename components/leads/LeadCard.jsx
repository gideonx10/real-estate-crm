import { Home } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatPrice, getInitials, sourceTone, statusBorder } from "@/lib/utils";

export function LeadCard({ lead, project }) {
  return (
    <Link href={`/leads/${lead.id}`} className={`block rounded-2xl border border-l-4 border-zinc-100 bg-white p-4 shadow-sm transition active:scale-[0.99] ${statusBorder[lead.status] || "border-l-zinc-300"}`}>
      <div className="grid grid-cols-[44px_1fr_auto] gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-gold text-sm font-bold text-navy">
          {getInitials(lead.full_name)}
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-bold text-navy">{lead.full_name}</h2>
          <p className="text-sm text-zinc-500">{lead.phone}</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
            <Home size={14} /> {project?.name || "No project"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone={sourceTone[lead.lead_source]}>{lead.lead_source}</Badge>
            <span className="text-xs font-semibold text-zinc-400">{formatDate(lead.created_at)}</span>
          </div>
        </div>
        <div className="text-right">
          <Badge>{lead.status}</Badge>
          <p className="mt-2 text-sm font-bold text-navy">{formatPrice(lead.budget)}</p>
        </div>
      </div>
    </Link>
  );
}
