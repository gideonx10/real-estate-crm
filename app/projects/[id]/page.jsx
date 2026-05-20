"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Home, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LeadCard } from "@/components/leads/LeadCard";
import { useCRMData } from "@/lib/use-crm-data";
import { formatPrice, projectMetrics } from "@/lib/utils";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const data = useCRMData();
  if (!data) return null;

  const project = data.projects.find((item) => item.id === id);
  if (!project) {
    return (
      <div className="grid gap-4">
        <Button href="/projects" variant="secondary">Back to Projects</Button>
        <Card>Project not found.</Card>
      </div>
    );
  }

  const builder = data.builders.find((item) => item.id === project.builder_id);
  const units = data.units.filter((unit) => unit.project_id === project.id);
  const leads = data.leads.filter((lead) => lead.interested_project_id === project.id);
  const metrics = projectMetrics(project, data.units);

  return (
    <div className="grid gap-5">
      <header className="flex items-center gap-3">
        <Button href="/projects" variant="secondary" size="icon" aria-label="Back to projects">
          <ArrowLeft size={19} />
        </Button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-bold text-navy">{project.name}</h1>
            <Badge>{project.status}</Badge>
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-zinc-500">
            <MapPin size={15} /> {project.location} · {builder?.company_name || "No builder"}
          </p>
        </div>
      </header>

      <Card>
        <div className="mb-2 flex justify-between text-sm font-semibold text-zinc-600">
          <span>{metrics.percentSold}% sold</span>
          <span>{formatPrice(project.price_from)} - {formatPrice(project.price_to)}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gold/30">
          <div className="h-full rounded-full bg-navy" style={{ width: `${metrics.percentSold}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          <DetailMetric label="Total" value={metrics.total} />
          <DetailMetric label="Available" value={metrics.available} className="text-success" />
          <DetailMetric label="Sold" value={metrics.sold} className="text-info" />
          <DetailMetric label="Reserved" value={metrics.reserved} className="text-warning" />
        </div>
      </Card>

      <Card>
        <h2 className="font-bold text-navy">Description</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{project.description || "No description added."}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(project.amenities || []).map((amenity) => (
            <span key={amenity} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">
              {amenity}
            </span>
          ))}
        </div>
      </Card>

      <section className="grid gap-3">
        <h2 className="text-lg font-bold text-navy">Units</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {units.map((unit) => (
            <Card key={unit.id} className="flex items-center justify-between">
              <div>
                <p className="font-bold text-navy">{unit.unit_number}</p>
                <p className="text-sm text-zinc-500">{unit.area_sqft} sq.ft · Floor {unit.floor}</p>
              </div>
              <div className="text-right">
                <Badge>{unit.status}</Badge>
                <p className="mt-1 text-sm font-bold text-navy">{formatPrice(unit.price)}</p>
              </div>
            </Card>
          ))}
          {!units.length ? <Card>No units added yet.</Card> : null}
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-navy"><Home size={19} /> Associated Leads</h2>
        {leads.map((lead) => <LeadCard key={lead.id} lead={lead} project={project} />)}
        {!leads.length ? <Card>No leads linked to this project yet.</Card> : null}
      </section>
    </div>
  );
}

function DetailMetric({ label, value, className = "text-navy" }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3">
      <p className={`text-xl font-bold ${className}`}>{value}</p>
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
    </div>
  );
}
