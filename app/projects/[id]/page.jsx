"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Edit3, ExternalLink, FileText, Home, MapPin, Plus, RefreshCw, Trash2, TrendingUp, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { LeadCard } from "@/components/leads/LeadCard";
import { deleteProjectBrochure, uploadProjectBrochure } from "@/app/actions/cloudinary";
import { createCRMRecord, deleteCRMRecord, updateCRMRecord } from "@/lib/crm-client";
import { useCRMData } from "@/lib/use-crm-data";
import { cn, formatCalendarDate, formatPrice, projectMetrics, statusButtonTone, statusTone } from "@/lib/utils";

const unitStatuses = ["Available", "Under Negotiation", "Sold", "Reserved"];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const data = useCRMData();
  const [updatingUnitId, setUpdatingUnitId] = useState("");
  const [addUnitOpen, setAddUnitOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [brochureMessage, setBrochureMessage] = useState("");
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [confirmDeleteUnit, setConfirmDeleteUnit] = useState(null);
  const [confirmDeleteBrochureId, setConfirmDeleteBrochureId] = useState(null);

  const project = useMemo(() => data?.projects.find((item) => item.id === id), [data, id]);
  const builder = useMemo(() => data?.builders.find((item) => item.id === project?.builder_id), [data, project]);
  const units = useMemo(() => data?.units.filter((unit) => unit.project_id === project?.id) || [], [data, project]);
  const leads = useMemo(() => data?.leads.filter((lead) => lead.interested_project_id === project?.id) || [], [data, project]);
  const brochures = useMemo(
    () => (data?.project_brochures || []).filter((b) => b.project_id === project?.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [data, project]
  );
  const priceHistory = useMemo(
    () =>
      (data?.project_price_history || [])
        .filter((item) => item.project_id === project?.id)
        .sort((a, b) => new Date(b.effective_date || b.created_at) - new Date(a.effective_date || a.created_at)),
    [data, project]
  );

  if (!data) return null;
  if (!project) {
    return (
      <div className="grid gap-4">
        <Button href="/projects" variant="secondary">Back to Projects</Button>
        <Card>Project not found.</Card>
      </div>
    );
  }

  const metrics = projectMetrics(project, data.units);

  async function updateUnitStatus(unit, nextStatus) {
    if (updatingUnitId || unit.status === nextStatus) return;
    setUpdatingUnitId(unit.id);
    try {
      await updateCRMRecord("units", unit.id, { status: nextStatus });
    } finally {
      setUpdatingUnitId("");
    }
  }

  async function deleteUnit(unitId) {
    if (updatingUnitId) return;
    setConfirmDeleteUnit(null);
    setUpdatingUnitId(unitId);
    try {
      await deleteCRMRecord("units", unitId);
      await updateCRMRecord("projects", project.id, { total_units: Math.max(0, metrics.total - 1) });
    } finally {
      setUpdatingUnitId("");
    }
  }

  async function addUnit(event) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      await createCRMRecord("units", {
        project_id: project.id,
        unit_number: form.get("unit_number"),
        floor: Number(form.get("floor") || 0),
        area_sqft: Number(form.get("area_sqft") || 0),
        price: Number(form.get("price") || 0),
        status: form.get("status") || "Available",
        notes: form.get("notes") || null,
      });
      await updateCRMRecord("projects", project.id, { total_units: metrics.total + 1 });
      setAddUnitOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function updateProjectDetails(event) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const amenities = String(form.get("amenities") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    try {
      await updateCRMRecord("projects", project.id, {
        name: form.get("name"),
        location: form.get("location"),
        description: form.get("description"),
        status: form.get("status"),
        amenities,
      });
      setEditOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function addPriceHistory(event) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const priceFrom = Number(form.get("price_from") || 0);
    const priceTo = Number(form.get("price_to") || 0);
    try {
      await createCRMRecord("project_price_history", {
        project_id: project.id,
        price_from: priceFrom,
        price_to: priceTo,
        note: form.get("note") || "Current price",
        effective_date: new Date().toISOString(),
      });
      await updateCRMRecord("projects", project.id, { price_from: priceFrom, price_to: priceTo });
      setPriceOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBrochureAdd(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingBrochure(true);
    setBrochureMessage("");
    try {
      const formData = new FormData();
      formData.set("projectId", project.id);
      formData.set("file", file);
      const result = await uploadProjectBrochure(formData);
      if (!result.ok) throw new Error(result.error || "Unable to upload brochure");
      window.dispatchEvent(new CustomEvent("crm-data-changed"));
      setBrochureMessage("Brochure uploaded.");
    } catch (error) {
      setBrochureMessage(error.message || "Unable to upload brochure");
    } finally {
      setUploadingBrochure(false);
      event.target.value = "";
    }
  }

  async function handleBrochureDelete(brochure) {
    if (!brochure) return;
    setConfirmDeleteBrochureId(null);
    setUploadingBrochure(true);
    setBrochureMessage("");
    try {
      const formData = new FormData();
      formData.set("brochureId", brochure.id);
      formData.set("publicId", brochure.public_id);
      const result = await deleteProjectBrochure(formData);
      if (!result.ok) throw new Error(result.error || "Unable to delete brochure");
      window.dispatchEvent(new CustomEvent("crm-data-changed"));
      setBrochureMessage("Brochure removed.");
    } catch (error) {
      setBrochureMessage(error.message || "Unable to delete brochure");
    } finally {
      setUploadingBrochure(false);
    }
  }

  const brochureToDelete = brochures.find((b) => b.id === confirmDeleteBrochureId);

  return (
    <div className="grid gap-5">
      <Header project={project} builder={builder} onEdit={() => setEditOpen(true)} />
      <ProjectSummary project={project} metrics={metrics} />
      <ProjectDescription project={project} />
      <UnitsSection
        units={units}
        updatingUnitId={updatingUnitId}
        onAdd={() => setAddUnitOpen(true)}
        onDelete={(unitId) => setConfirmDeleteUnit(units.find((u) => u.id === unitId) || { id: unitId, unit_number: unitId })}
        onStatus={updateUnitStatus}
      />
      <BrochureSection
        brochures={brochures}
        message={brochureMessage}
        uploading={uploadingBrochure}
        onAdd={handleBrochureAdd}
        onDelete={(brochureId) => setConfirmDeleteBrochureId(brochureId)}
      />
      <PriceHistorySection project={project} priceHistory={priceHistory} onUpdate={() => setPriceOpen(true)} />
      <AssociatedLeads leads={leads} project={project} />

      <Modal open={addUnitOpen} title="Add Unit" onClose={() => setAddUnitOpen(false)}>
        <form onSubmit={addUnit} className="grid gap-4">
          <Input label="Unit Number*" name="unit_number" required placeholder="Unit 101" />
          <div className="grid gap-4 min-[420px]:grid-cols-2">
            <Input label="Floor" name="floor" type="number" inputMode="numeric" placeholder="1" />
            <Input label="Area (sqft)" name="area_sqft" type="number" inputMode="decimal" placeholder="850" />
          </div>
          <Input label="Price (₹)" name="price" type="number" inputMode="numeric" min="0" placeholder="9500000" />
          <label className="grid gap-2 text-sm font-semibold text-zinc-700">
            Status
            <select name="status" className="h-12 rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-950 outline-none focus:border-navy focus:ring-4 focus:ring-navy/10">
              {unitStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <Input label="Note" name="notes" placeholder="Tower, facing, buyer context..." />
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            <Plus size={18} /> {submitting ? "Adding Unit..." : "Add Unit"}
          </Button>
        </form>
      </Modal>

      <Modal open={editOpen} title="Edit Project" onClose={() => setEditOpen(false)}>
        <form onSubmit={updateProjectDetails} className="grid gap-4">
          <Input label="Project Name*" name="name" defaultValue={project.name || ""} required />
          <Input label="Location*" name="location" defaultValue={project.location || ""} required />
          <Textarea label="Description" name="description" defaultValue={project.description || ""} />
          <label className="grid gap-2 text-sm font-semibold text-zinc-700">
            Status
            <select name="status" defaultValue={project.status || "Active"} className="h-12 rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-950 outline-none focus:border-navy focus:ring-4 focus:ring-navy/10">
              {["Active", "Upcoming", "Completed"].map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <Input label="Amenities" name="amenities" defaultValue={(project.amenities || []).join(", ")} placeholder="Gym, Pool, Parking" />
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            <Check size={18} /> {submitting ? "Saving..." : "Save Project"}
          </Button>
        </form>
      </Modal>

      <Modal open={priceOpen} title="Update Price List" onClose={() => setPriceOpen(false)}>
        <form onSubmit={addPriceHistory} className="grid gap-4">
          <p className="-mt-3 text-sm font-semibold text-zinc-500">{project.name}</p>
          <div className="grid gap-4 min-[420px]:grid-cols-2">
            <Input label="Price From (₹) *" name="price_from" type="number" inputMode="numeric" min="0" defaultValue={project.price_from || ""} required />
            <Input label="Price To (₹) *" name="price_to" type="number" inputMode="numeric" min="0" defaultValue={project.price_to || ""} required />
          </div>
          <Input label="Note (optional)" name="note" placeholder="e.g. Post-festive revision" />
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            <Check size={18} /> {submitting ? "Saving..." : "Save Price Update"}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDeleteUnit}
        message={`Are you sure you want to delete "${confirmDeleteUnit?.unit_number || ""}"?`}
        onConfirm={() => deleteUnit(confirmDeleteUnit?.id)}
        onCancel={() => setConfirmDeleteUnit(null)}
      />

      <ConfirmDialog
        open={!!confirmDeleteBrochureId}
        message={`Are you sure you want to delete "${brochureToDelete?.name || "this brochure"}"?`}
        onConfirm={() => handleBrochureDelete(brochureToDelete)}
        onCancel={() => setConfirmDeleteBrochureId(null)}
      />
    </div>
  );
}

function BrochureSection({ brochures, message, uploading, onAdd, onDelete }) {
  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold text-navy">
          <FileText size={20} /> Brochures {brochures.length > 0 ? `(${brochures.length})` : ""}
        </h2>
        <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy/90">
          <Plus size={17} /> {uploading ? "Uploading..." : "Add Brochure"}
          <input className="sr-only" type="file" accept="application/pdf" onChange={onAdd} disabled={uploading} />
        </label>
      </div>
      <Card>
        {brochures.length > 0 ? (
          <div className="grid gap-3">
            {brochures.map((brochure) => (
              <div key={brochure.id} className="flex flex-col gap-3 rounded-xl bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy/10 text-navy">
                    <FileText size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-navy">{brochure.name}</p>
                    <p className="truncate text-xs font-semibold text-zinc-400">{formatCalendarDate(brochure.created_at)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a href={brochure.url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white text-navy ring-1 ring-zinc-200 hover:bg-zinc-50 h-11 px-4 text-sm font-semibold transition-colors">
                    <ExternalLink size={16} /> Open
                  </a>
                  <Button type="button" variant="danger" size="icon" aria-label={`Delete ${brochure.name}`} onClick={() => onDelete(brochure.id)} disabled={uploading}>
                    <Trash2 size={17} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid min-h-32 place-items-center text-center text-sm font-semibold text-zinc-500">
            <div>
              <FileText className="mx-auto mb-2 text-zinc-300" size={36} />
              No brochures yet. Upload a PDF.
            </div>
          </div>
        )}
        {message ? <p className="mt-3 text-sm font-semibold text-zinc-600">{message}</p> : null}
      </Card>
    </section>
  );
}

function Header({ project, builder, onEdit }) {
  return (
    <header className="flex items-center gap-3">
      <Button href="/projects" variant="secondary" size="icon" aria-label="Back to projects">
        <ArrowLeft size={19} />
      </Button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="truncate text-2xl font-bold text-navy">{project.name}</h1>
          <Badge>{project.status}</Badge>
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-zinc-500">
          <MapPin size={15} /> {project.location} · {builder?.company_name || "No builder"}
        </p>
      </div>
      <Button type="button" variant="secondary" size="icon" aria-label="Edit project" onClick={onEdit}>
        <Edit3 size={17} />
      </Button>
    </header>
  );
}

function ProjectSummary({ project, metrics }) {
  return (
    <Card>
      <div className="mb-2 flex justify-between gap-3 text-sm font-semibold text-zinc-600">
        <span>{metrics.percentSold}% sold</span>
        <span>{formatPrice(project.price_from)} - {formatPrice(project.price_to)}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-gold/30">
        <div className="h-full rounded-full bg-navy" style={{ width: `${metrics.percentSold}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <DetailMetric label="Total" value={metrics.total} />
        <DetailMetric label="Available" value={metrics.available} className="text-success" />
        <DetailMetric label="Sold" value={metrics.sold} className="text-info" />
        <DetailMetric label="Reserved" value={metrics.reserved} className="text-warning" />
      </div>
    </Card>
  );
}

function ProjectDescription({ project }) {
  return (
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
  );
}

function UnitsSection({ units, updatingUnitId, onAdd, onDelete, onStatus }) {
  const [filter, setFilter] = useState("All");
  const counts = {
    All: units.length,
    Available: units.filter((unit) => unit.status === "Available").length,
    "Under Negotiation": units.filter((unit) => unit.status === "Under Negotiation").length,
    Sold: units.filter((unit) => unit.status === "Sold").length,
    Reserved: units.filter((unit) => unit.status === "Reserved").length,
  };
  const visibleUnits = filter === "All" ? units : units.filter((unit) => unit.status === filter);

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-navy">Units ({units.length})</h2>
        <Button type="button" onClick={onAdd} className="rounded-xl">
          <Plus size={18} /> Add Unit
        </Button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All", ...unitStatuses].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={cn(
              "h-10 shrink-0 rounded-full border px-4 text-sm font-bold transition",
              filter === status ? "border-navy bg-navy text-white" : "border-zinc-200 bg-white text-zinc-500"
            )}
          >
            {status} ({counts[status] || 0})
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {visibleUnits.map((unit) => (
          <UnitCard key={unit.id} unit={unit} updating={updatingUnitId === unit.id} onDelete={onDelete} onStatus={onStatus} />
        ))}
        {!visibleUnits.length ? <Card>No units found for this filter.</Card> : null}
      </div>
    </section>
  );
}

function UnitCard({ unit, updating, onDelete, onStatus }) {
  const nextStatus = unit.status === "Sold" ? "Available" : "Sold";
  const tone = statusButtonTone[unit.status] || statusButtonTone.Available;

  return (
    <Card className="grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-lg font-bold text-navy">{unit.unit_number}</p>
          <p className="text-sm font-semibold text-zinc-500">
            Floor {unit.floor || "N/A"} · {Number(unit.area_sqft || 0).toLocaleString("en-IN")} sqft
          </p>
          <p className="mt-1 text-lg font-bold text-gold">{formatPrice(unit.price)}</p>
        </div>
        <Badge tone={statusTone[unit.status]}>{unit.status}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-4">
        {unitStatuses.map((status) => (
          <button
            key={status}
            type="button"
            disabled={updating}
            onClick={() => onStatus(unit, status)}
            className={cn(
              "min-h-10 rounded-xl border px-2 text-xs font-bold transition disabled:opacity-60",
              unit.status === status ? (statusButtonTone[status] || tone).active : (statusButtonTone[status] || tone).idle
            )}
          >
            {status}
          </button>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => onStatus(unit, nextStatus)} disabled={updating}>
          <RefreshCw size={16} /> Mark {nextStatus}
        </Button>
        <Button type="button" variant="danger" size="icon" aria-label={`Delete ${unit.unit_number}`} onClick={() => onDelete(unit.id)} disabled={updating}>
          <Trash2 size={17} />
        </Button>
      </div>
    </Card>
  );
}

function PriceHistorySection({ project, priceHistory, onUpdate }) {
  const history = priceHistory.length
    ? priceHistory
    : [
        {
          id: "current",
          price_from: project.price_from,
          price_to: project.price_to,
          note: "Current price",
          effective_date: project.updated_at || project.created_at,
        },
      ];

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold text-navy">
          <TrendingUp size={20} /> Price History
        </h2>
        <Button type="button" onClick={onUpdate}>
          <Plus size={18} /> Update
        </Button>
      </div>
      <Card className="grid gap-4">
        {history.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[24px_1fr] gap-3">
            <div className="grid justify-items-center">
              <span className={cn("mt-2 h-4 w-4 rounded-full border-2", index === 0 ? "border-navy bg-navy" : "border-navy bg-white")} />
              {index < history.length - 1 ? <span className="h-full min-h-14 w-px bg-zinc-200" /> : null}
            </div>
            <div className="rounded-xl bg-zinc-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-lg font-bold text-navy">{formatPrice(item.price_from)} - {formatPrice(item.price_to)}</p>
                {index === 0 ? <Badge>Latest</Badge> : null}
              </div>
              <p className="mt-1 text-sm font-semibold text-zinc-500">{formatCalendarDate(item.effective_date || item.created_at)}</p>
              <p className="text-sm text-zinc-600">{item.note || "Price update"}</p>
            </div>
          </div>
        ))}
      </Card>
    </section>
  );
}

function AssociatedLeads({ leads, project }) {
  return (
    <section className="grid gap-3">
      <h2 className="flex items-center gap-2 text-lg font-bold text-navy"><Home size={19} /> Associated Leads</h2>
      {leads.map((lead) => <LeadCard key={lead.id} lead={lead} project={project} />)}
      {!leads.length ? <Card>No leads linked to this project yet.</Card> : null}
    </section>
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

