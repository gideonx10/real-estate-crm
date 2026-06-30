import Link from "next/link";
import { Edit3, Eye, MapPin, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusDot = {
  Active: "bg-success",
  Upcoming: "bg-info",
  Completed: "bg-zinc-400",
};

const statusToneMap = {
  Active: "bg-success/10 text-success",
  Upcoming: "bg-info/10 text-info",
  Completed: "bg-zinc-100 text-zinc-500",
};

export function ProjectCard({ project, builder, units = [], onEdit, onDelete }) {
  const dot = statusDot[project.status] || "bg-zinc-300";
  const toneCls = statusToneMap[project.status] || "bg-zinc-100 text-zinc-500";
  const priceFrom = project.price_from ? formatPrice(project.price_from) : null;
  const priceTo = project.price_to ? formatPrice(project.price_to) : null;
  const priceLabel = priceFrom && priceTo ? `${priceFrom} – ${priceTo}` : priceFrom || priceTo;

  return (
    <Card className="flex items-center gap-3 px-4 py-3.5">
      {/* Status dot */}
      <div className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dot)} />

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="min-w-0 truncate font-bold text-navy">{project.name}</h2>
          <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold", toneCls)}>
            {project.status}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-zinc-500">
          <span className="flex min-w-0 items-center gap-1 truncate">
            <MapPin size={12} className="shrink-0" />
            {project.location || "No location"}
          </span>
          {builder ? (
            <span className="shrink-0 font-semibold text-zinc-600">
              {builder.company_name || builder.full_name}
            </span>
          ) : null}
        </div>
        {priceLabel ? (
          <p className="mt-1 text-sm font-bold text-gold">{priceLabel}</p>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        <Link
          href={`/projects/${project.id}`}
          aria-label={`View ${project.name}`}
          className="grid h-8 w-8 place-items-center rounded-lg bg-navy/8 text-navy transition hover:bg-navy/15"
        >
          <Eye size={15} />
        </Link>
        {onEdit ? (
          <button
            type="button"
            onClick={() => onEdit(project)}
            aria-label={`Edit ${project.name}`}
            className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200"
          >
            <Edit3 size={15} />
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(project)}
            aria-label={`Delete ${project.name}`}
            className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
          >
            <Trash2 size={15} />
          </button>
        ) : null}
      </div>
    </Card>
  );
}
