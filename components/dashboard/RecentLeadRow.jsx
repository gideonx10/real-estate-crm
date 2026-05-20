import { Home } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatPrice, getInitials, sourceTone } from "@/lib/utils";

export function RecentLeadRow({ lead, project }) {
  return (
    <div className="grid grid-cols-[44px_1fr] gap-3 rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-navy text-sm font-bold text-white">
        {getInitials(lead.full_name)}
      </div>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-bold text-navy">{lead.full_name}</p>
            <p className="text-sm text-zinc-500">{lead.phone}</p>
          </div>
          <span className="shrink-0 text-xs font-semibold text-zinc-400">{formatDate(lead.created_at)}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500">
            <Home size={13} /> {project?.name || "No project"}
          </span>
          <Badge tone={sourceTone[lead.lead_source]}>{lead.lead_source}</Badge>
          <Badge>{lead.status}</Badge>
          <span className="text-xs font-bold text-navy">{formatPrice(lead.budget)}</span>
        </div>
      </div>
    </div>
  );
}
