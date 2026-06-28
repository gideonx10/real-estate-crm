import Link from "next/link";
import { Edit3, MapPin, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatPrice, projectMetrics } from "@/lib/utils";

const statusBar = {
  Active: "bg-success",
  Upcoming: "bg-info",
  Completed: "bg-zinc-400",
};

export function ProjectCard({ project, builder, units = [], onEdit, onDelete }) {
  const metrics = projectMetrics(project, units);

  return (
    <Card className="overflow-hidden p-0">
      <div className={`h-2 ${statusBar[project.status] || "bg-zinc-300"}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-navy">{project.name}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
              <MapPin size={15} /> {project.location}
            </p>
            <p className="mt-1 text-sm font-semibold text-zinc-500">{builder?.company_name || "No builder assigned"}</p>
          </div>
          <Badge>{project.status}</Badge>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex justify-between text-sm font-semibold text-zinc-600">
            <span>{metrics.percentSold}% sold</span>
            <span>{formatPrice(project.price_from)} - {formatPrice(project.price_to)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gold/30">
            <div className="h-full rounded-full bg-navy" style={{ width: `${metrics.percentSold}%` }} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          <Metric label="Total" value={metrics.total} />
          <Metric label="Available" value={metrics.available} className="text-success" />
          <Metric label="Sold" value={metrics.sold} className="text-info" />
          <Metric label="Reserved" value={metrics.reserved} className="text-warning" />
        </div>

        <div className="mt-4 flex min-h-10 items-center justify-between gap-3">
          <Link href={`/projects/${project.id}`} className="inline-flex font-bold text-gold">
            View
          </Link>
          {onEdit || onDelete ? (
            <div className="flex gap-2">
              {onEdit ? (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  aria-label={`Edit ${project.name}`}
                  title="Edit project"
                  onClick={() => onEdit(project)}
                >
                  <Edit3 size={17} />
                </Button>
              ) : null}
              {onDelete ? (
                <Button
                  type="button"
                  size="icon"
                  variant="danger"
                  aria-label={`Delete ${project.name}`}
                  title="Delete project"
                  onClick={() => onDelete(project)}
                >
                  <Trash2 size={17} />
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function Metric({ label, value, className = "text-navy" }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-2">
      <p className={`text-lg font-bold ${className}`}>{value}</p>
      <p className="text-[11px] font-semibold text-zinc-500">{label}</p>
    </div>
  );
}
