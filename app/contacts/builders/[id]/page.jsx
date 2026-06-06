"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Edit3, Globe, Mail, MapPin, Phone, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { updateCRMRecord } from "@/lib/crm-client";
import { useCRMData } from "@/lib/use-crm-data";
import { cn, getInitials, projectMetrics } from "@/lib/utils";

const tabs = ["All", "Active", "Upcoming", "Completed"];

export default function BuilderProfilePage() {
  const { id } = useParams();
  const data = useCRMData();
  const [tab, setTab] = useState("All");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const builder = useMemo(() => data?.builders.find((item) => item.id === id), [data, id]);
  const projects = useMemo(() => {
    if (!data) return [];
    return data.projects.filter((project) => project.builder_id === id && (tab === "All" || project.status === tab));
  }, [data, id, tab]);

  if (!data) return null;
  if (!builder) {
    return (
      <div className="grid gap-4">
        <Button href="/contacts" variant="secondary">Back to Contacts</Button>
        <Card>Builder not found.</Card>
      </div>
    );
  }

  const allBuilderProjects = data.projects.filter((project) => project.builder_id === builder.id);
  const activeCount = allBuilderProjects.filter((project) => project.status === "Active").length;
  const completedCount = allBuilderProjects.filter((project) => project.status === "Completed").length;
  const soldUnits = allBuilderProjects.reduce((sum, project) => sum + projectMetrics(project, data.units).sold, 0);

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      await updateCRMRecord("builders", builder.id, {
        full_name: form.get("full_name"),
        company_name: form.get("company_name"),
        brand_tagline: form.get("brand_tagline"),
        established_year: Number(form.get("established_year") || 0),
        office_address: form.get("office_address"),
        phone: form.get("phone"),
        email: form.get("email"),
        website: form.get("website"),
        notes: form.get("notes"),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5">
      <header className="sticky top-0 z-20 -mx-4 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Button href="/contacts" variant="secondary" className="rounded-full" aria-label="Back to contacts">
          <ArrowLeft size={19} /> Back
        </Button>
        <h1 className="truncate text-lg font-bold text-navy">{builder.company_name || builder.full_name}</h1>
        <div className="w-24" />
      </header>

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-slate-500 text-white shadow-lg shadow-navy/15">
        <div className="p-5">
          <div className="grid grid-cols-[76px_1fr] gap-4">
            <div
              className="grid h-20 w-20 place-items-center rounded-3xl bg-white/15 text-xl font-bold ring-1 ring-white/20"
              style={{ backgroundColor: builder.brand_color || undefined }}
            >
              {builder.logo_url ? (
                <span>{getInitials(builder.company_name || builder.full_name)}</span>
              ) : (
                getInitials(builder.company_name || builder.full_name)
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold">{builder.company_name || builder.full_name}</h2>
              <p className="mt-1 text-white/80">{builder.brand_tagline || "Builder partner"}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-white/85">
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1">
                  <Calendar size={15} /> Est. {builder.established_year || "N/A"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1">
                  <MapPin size={15} /> {builder.office_address || "Location not set"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2">
            <ProfileAction href={`tel:${builder.phone}`} icon={Phone} label="Call" />
            <ProfileAction href={`mailto:${builder.email || ""}`} icon={Mail} label="Email" />
            <ProfileAction href={builder.website || "#"} icon={Globe} label="Website" />
            <button
              type="button"
              onClick={() => setEditing((value) => !value)}
              className="grid min-h-14 place-items-center rounded-2xl bg-white/15 px-2 text-sm font-bold"
            >
              <Edit3 size={22} /> Edit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 border-t border-white/20 bg-white text-center text-navy">
          <BrandStat label="Projects" value={allBuilderProjects.length} />
          <BrandStat label="Active" value={activeCount} className="text-success" />
          <BrandStat label="Completed" value={completedCount} className="text-zinc-500" />
          <BrandStat label="Units Sold" value={soldUnits} className="text-gold" />
        </div>
      </section>

      {editing ? (
        <Card>
          <form onSubmit={handleSave} className="grid gap-4">
            <Input label="Contact Name" name="full_name" defaultValue={builder.full_name || ""} required />
            <Input label="Brand Name" name="company_name" defaultValue={builder.company_name || ""} />
            <Input label="Tagline" name="brand_tagline" defaultValue={builder.brand_tagline || ""} />
            <Input label="Start Date / Established Year" name="established_year" type="number" defaultValue={builder.established_year || ""} />
            <Textarea label="Location" name="office_address" defaultValue={builder.office_address || ""} />
            <Input label="Phone" name="phone" defaultValue={builder.phone || ""} required />
            <Input label="Email" name="email" defaultValue={builder.email || ""} />
            <Input label="Website" name="website" defaultValue={builder.website || ""} />
            <Textarea label="Notes" name="notes" defaultValue={builder.notes || ""} />
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Details"}</Button>
          </form>
        </Card>
      ) : null}

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-950">Projects</h2>
          <Button href="/projects/add" className="rounded-2xl">
            <Plus size={18} /> Add Project
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-bold",
                tab === item ? "bg-navy text-white" : "bg-white text-zinc-600 ring-1 ring-zinc-200"
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} builder={builder} units={data.units} />
          ))}
          {!projects.length ? <Card>No projects found for this filter.</Card> : null}
        </div>
      </section>
    </div>
  );
}

function ProfileAction({ href, icon: Icon, label }) {
  return (
    <a href={href} className="grid min-h-14 place-items-center rounded-2xl bg-white/15 px-2 text-sm font-bold">
      <Icon size={22} /> {label}
    </a>
  );
}

function BrandStat({ label, value, className = "text-navy" }) {
  return (
    <div className="border-r border-zinc-200 p-4 last:border-r-0">
      <p className={cn("text-2xl font-bold", className)}>{value}</p>
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
    </div>
  );
}
