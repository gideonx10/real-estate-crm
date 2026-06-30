"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Map, Plus, Save, LayoutGrid } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectSearchBar } from "@/components/projects/ProjectSearchBar";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { deleteCRMRecord, updateCRMRecord } from "@/lib/crm-client";
import { useCRMData } from "@/lib/use-crm-data";
import { cn } from "@/lib/utils";

const tabs = ["All", "Active", "Upcoming", "Completed"];
const PortfolioMapPanel = dynamic(
  () =>
    import("@/components/projects/PortfolioMapPanel").then(
      (module) => module.PortfolioMapPanel
    ),
  { ssr: false, loading: () => <div className="h-130 animate-pulse rounded-2xl bg-zinc-100" /> }
);
const LocationPicker = dynamic(
  () =>
    import("@/components/maps/LocationPicker").then((module) => module.LocationPicker),
  { ssr: false, loading: () => <div className="h-56 animate-pulse rounded-xl bg-zinc-100" /> }
);

export default function ProjectsPage() {
  const data = useCRMData();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("All");
  const [view, setView] = useState("list");
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const projects = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.projects.filter((project) => {
      const matchesTab = tab === "All" || project.status === tab;
      if (!q) return matchesTab;
      const builder = data.builders.find((b) => b.id === project.builder_id);
      const builderName = builder
        ? (builder.company_name || builder.full_name || "").toLowerCase()
        : "";
      const matchesQuery =
        project.name.toLowerCase().includes(q) ||
        (project.location || "").toLowerCase().includes(q) ||
        builderName.includes(q);
      return matchesTab && matchesQuery;
    });
  }, [data, query, tab]);

  if (!data) return null;

  async function saveProject(payload) {
    if (!editingProject || saving) return;
    setSaving(true);
    setMessage("");
    try {
      await updateCRMRecord("projects", editingProject.id, payload);
      setEditingProject(null);
      setMessage("Project updated.");
    } catch (error) {
      setMessage(error.message || "Unable to update project.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject() {
    if (!deletingProject || deleting) return;
    setDeleting(true);
    setMessage("");
    try {
      await deleteCRMRecord("projects", deletingProject.id);
      setDeletingProject(null);
      setMessage("Project deleted.");
    } catch (error) {
      setMessage(error.message || "Unable to delete project.");
    } finally {
      setDeleting(false);
    }
  }

  const linkedUnitCount = deletingProject
    ? data.units.filter((unit) => unit.project_id === deletingProject.id).length
    : 0;
  const linkedLeadCount = deletingProject
    ? data.leads.filter((lead) => lead.interested_project_id === deletingProject.id).length
    : 0;

  return (
    <div className="grid gap-5">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-navy">Projects</h1>
        <Button href="/projects/add" size="icon" aria-label="Add project">
          <Plus size={21} />
        </Button>
      </header>

      {/* View toggle */}
      <div className="grid grid-cols-2 rounded-xl bg-white p-1 ring-1 ring-zinc-200">
        <ViewButton
          active={view === "list"}
          icon={LayoutGrid}
          label="Project List"
          onClick={() => setView("list")}
        />
        <ViewButton
          active={view === "map"}
          icon={Map}
          label="Map Overview"
          onClick={() => setView("map")}
        />
      </div>

      {message ? (
        <p className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-600">
          {message}
        </p>
      ) : null}

      {view === "list" ? (
        <>
          {/* Grouped suggestion search */}
          <ProjectSearchBar
            projects={data.projects}
            builders={data.builders}
            query={query}
            onChange={setQuery}
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-bold",
                  tab === item ? "bg-navy text-white" : "bg-white text-zinc-600"
                )}
              >
                {item}
              </button>
            ))}
          </div>

          <section className="grid gap-2">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                units={data.units}
                builder={data.builders.find((builder) => builder.id === project.builder_id)}
                onEdit={setEditingProject}
                onDelete={setDeletingProject}
              />
            ))}
            {!projects.length ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center font-semibold text-zinc-500">
                No projects match this filter.
              </div>
            ) : null}
          </section>
        </>
      ) : (
        <PortfolioMapPanel projects={data.projects} builders={data.builders} />
      )}

      <Modal
        open={!!editingProject}
        title="Edit Project"
        onClose={() => !saving && setEditingProject(null)}
      >
        {editingProject ? (
          <ProjectEditForm
            key={editingProject.id}
            project={editingProject}
            builders={data.builders}
            saving={saving}
            onSave={saveProject}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={!!deletingProject}
        title="Delete Project"
        message={`Delete "${deletingProject?.name || ""}"? ${linkedUnitCount} units will be deleted and ${linkedLeadCount} linked leads will be unassigned. Brochures and price history will also be removed.`}
        confirming={deleting}
        onConfirm={deleteProject}
        onCancel={() => !deleting && setDeletingProject(null)}
      />
    </div>
  );
}

function ViewButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-bold",
        active ? "bg-navy text-white" : "text-zinc-500"
      )}
    >
      <Icon size={18} /> {label}
    </button>
  );
}

function ProjectEditForm({ project, builders, saving, onSave }) {
  const [coords, setCoords] = useState(
    project.latitude != null && project.longitude != null
      ? { latitude: Number(project.latitude), longitude: Number(project.longitude) }
      : null
  );

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({
      name: String(form.get("name") || "").trim(),
      location: String(form.get("location") || "").trim(),
      description: String(form.get("description") || "").trim(),
      builder_id: String(form.get("builder_id") || "") || null,
      price_from: Number(form.get("price_from") || 0),
      price_to: Number(form.get("price_to") || 0),
      status: String(form.get("status") || "Active"),
      amenities: String(form.get("amenities") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Input label="Project Name*" name="name" defaultValue={project.name || ""} required />
      <Input label="Location*" name="location" defaultValue={project.location || ""} required />
      <Textarea label="Description" name="description" defaultValue={project.description || ""} />
      <label className="grid gap-2 text-sm font-semibold text-zinc-700">
        Builder
        <select
          name="builder_id"
          defaultValue={project.builder_id || ""}
          className="h-12 rounded-xl border border-zinc-200 bg-white px-4 text-base outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
        >
          <option value="">No builder assigned</option>
          {builders.map((builder) => (
            <option key={builder.id} value={builder.id}>
              {builder.company_name || builder.full_name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Price From"
          name="price_from"
          type="number"
          min="0"
          defaultValue={project.price_from || 0}
        />
        <Input
          label="Price To"
          name="price_to"
          type="number"
          min="0"
          defaultValue={project.price_to || 0}
        />
      </div>
      <label className="grid gap-2 text-sm font-semibold text-zinc-700">
        Status
        <select
          name="status"
          defaultValue={project.status || "Active"}
          className="h-12 rounded-xl border border-zinc-200 bg-white px-4 text-base outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
        >
          {tabs.slice(1).map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </label>
      <Input
        label="Amenities"
        name="amenities"
        defaultValue={(project.amenities || []).join(", ")}
      />
      <div className="grid gap-2">
        <span className="text-sm font-semibold text-zinc-700">Map Position</span>
        <LocationPicker coords={coords} onChange={setCoords} className="h-56" />
        <p className="text-xs font-semibold text-zinc-500">
          Drag the map or search to set the project location.
        </p>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={saving}>
        <Save size={18} /> {saving ? "Saving…" : "Save Project"}
      </Button>
    </form>
  );
}
