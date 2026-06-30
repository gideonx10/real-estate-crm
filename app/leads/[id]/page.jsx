"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Banknote, Check, Edit3, Home, MapPin, Phone, Tag, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { deleteCRMRecord, updateCRMRecord } from "@/lib/crm-client";
import { useCRMData } from "@/lib/use-crm-data";
import { cn, formatDate, formatPrice, getInitials, statusButtonTone, statusTone } from "@/lib/utils";

const LeadLocationPicker = dynamic(
  () => import("@/components/leads/LeadLocationPicker").then((m) => m.LeadLocationPicker),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-2xl bg-zinc-100" /> }
);

const statusOptions = ["New", "Contacted", "Site Visit", "Converted"];
const sources = ["Walk-in", "Broker", "Online", "Referral", "Other"];
const statuses = ["New", "Contacted", "Site Visit", "Converted", "Lost"];

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const data = useCRMData();

  const [updating, setUpdating] = useState(false);
  const [confirmDeleteLead, setConfirmDeleteLead] = useState(false);

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editSource, setEditSource] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editProjectId, setEditProjectId] = useState("");
  const [editCoords, setEditCoords] = useState(null);
  const [editError, setEditError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const lead = useMemo(() => data?.leads.find((item) => item.id === id), [data, id]);
  const project = useMemo(
    () => data?.projects.find((item) => item.id === lead?.interested_project_id),
    [data, lead]
  );

  if (!data) return null;
  if (!lead) {
    return (
      <div className="grid gap-4">
        <Button href="/leads" variant="secondary">Back to Leads</Button>
        <Card>Lead not found.</Card>
      </div>
    );
  }

  function openEdit() {
    setEditSource(lead.lead_source || "Walk-in");
    setEditStatus(lead.status || "New");
    setEditProjectId(lead.interested_project_id || "");
    setEditCoords(
      lead.latitude != null && lead.longitude != null
        ? { latitude: Number(lead.latitude), longitude: Number(lead.longitude) }
        : null
    );
    setEditError("");
    setEditOpen(true);
  }

  async function updateStatus(nextStatus) {
    if (updating || lead.status === nextStatus) return;
    setUpdating(true);
    try {
      await updateCRMRecord("leads", lead.id, { status: nextStatus });
    } finally {
      setUpdating(false);
    }
  }

  async function handleUpdateLead(event) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setEditError("");
    const form = new FormData(event.currentTarget);
    try {
      await updateCRMRecord("leads", lead.id, {
        full_name: String(form.get("full_name") || "").trim(),
        phone: String(form.get("phone") || "").trim(),
        email: String(form.get("email") || "").trim() || null,
        lead_source: editSource,
        budget: Number(form.get("budget") || 0),
        interested_project_id: editProjectId || null,
        status: editStatus,
        notes: String(form.get("notes") || "").trim() || null,
        latitude: editCoords?.latitude ?? null,
        longitude: editCoords?.longitude ?? null,
        location_address: editCoords
          ? `${editCoords.latitude}, ${editCoords.longitude}`
          : (lead.location_address || null),
      });
      setEditOpen(false);
    } catch (error) {
      setEditError(error.message || "Unable to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteLead() {
    if (updating) return;
    setConfirmDeleteLead(false);
    setUpdating(true);
    try {
      await deleteCRMRecord("leads", lead.id);
      router.push("/leads");
    } finally {
      setUpdating(false);
    }
  }

  const pageProps = { lead, project, updating, updateStatus, openEdit, onRequestDelete: () => setConfirmDeleteLead(true) };

  return (
    <>
      <LeadDetailMobile {...pageProps} />
      <LeadDetailDesktop {...pageProps} />

      {/* Edit modal */}
      <Modal open={editOpen} title="Edit Lead" onClose={() => !submitting && setEditOpen(false)}>
        <form onSubmit={handleUpdateLead} className="grid gap-4">
          <Input label="Full Name*" name="full_name" defaultValue={lead.full_name || ""} required />
          <Input label="Phone Number*" name="phone" defaultValue={lead.phone || ""} required inputMode="tel" />
          <Input label="Email" name="email" type="email" defaultValue={lead.email || ""} />

          <PillGroup label="Lead Source" items={sources} value={editSource} onChange={setEditSource} />

          <Input label="Budget (₹)" name="budget" type="number" min="0" inputMode="numeric" defaultValue={lead.budget || ""} />

          <div className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-700">Interested Project</span>
            <select
              value={editProjectId}
              onChange={(e) => setEditProjectId(e.target.value)}
              className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-950 outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
            >
              <option value="">No project selected</option>
              {(data?.projects || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.location}
                </option>
              ))}
            </select>
          </div>

          <PillGroup label="Status" items={statuses} value={editStatus} onChange={setEditStatus} />

          <Textarea label="Notes" name="notes" defaultValue={lead.notes || ""} placeholder="Requirements, follow-up notes..." />

          <div className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-700">Map Location</span>
            <LeadLocationPicker coords={editCoords} onChange={setEditCoords} />
            <p className="text-xs font-semibold text-zinc-500">
              Search or tap the map to update this lead's location.
            </p>
          </div>

          {editError ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{editError}</p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            <Check size={18} /> {submitting ? "Saving..." : "Save Lead"}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDeleteLead}
        message={`Are you sure you want to delete "${lead.full_name}"?`}
        onConfirm={deleteLead}
        onCancel={() => setConfirmDeleteLead(false)}
      />
    </>
  );
}

function LeadDetailMobile({ lead, project, updating, updateStatus, openEdit, onRequestDelete }) {
  return (
    <div className="grid w-full max-w-full gap-5 md:hidden">
      <header className="sticky top-0 z-20 -mx-4 grid grid-cols-[auto_1fr] items-center gap-3 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
        <Button href="/leads" variant="secondary" className="rounded-full px-4" aria-label="Back to leads">
          <ArrowLeft size={19} /> Back
        </Button>
        <h1 className="min-w-0 truncate text-base font-bold text-navy">{lead.full_name}</h1>
      </header>

      <LeadHeroCard lead={lead} onRequestEdit={openEdit} onRequestDelete={onRequestDelete} />
      <StatusCard lead={lead} updating={updating} updateStatus={updateStatus} />
      <LeadDetailsCard lead={lead} project={project} />
    </div>
  );
}

function LeadDetailDesktop({ lead, project, updating, updateStatus, openEdit, onRequestDelete }) {
  return (
    <div className="hidden gap-6 md:grid">
      <header className="flex items-center justify-between">
        <Button href="/leads" variant="secondary" className="rounded-full" aria-label="Back to leads">
          <ArrowLeft size={19} /> Back to Leads
        </Button>
        <h1 className="text-2xl font-bold text-navy">{lead.full_name}</h1>
        <Button type="button" variant="secondary" onClick={openEdit} aria-label="Edit lead">
          <Edit3 size={17} /> Edit
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <LeadHeroCard lead={lead} onRequestEdit={openEdit} onRequestDelete={onRequestDelete} />
        <LeadDetailsCard lead={lead} project={project} />
      </div>
      <StatusCard lead={lead} updating={updating} updateStatus={updateStatus} />
    </div>
  );
}

function LeadHeroCard({ lead, onRequestEdit, onRequestDelete }) {
  const lost = lead.status === "Lost";
  const avatarTone = statusButtonTone[lead.status]?.avatar || "bg-zinc-100 text-zinc-700";

  return (
    <Card className="grid w-full max-w-full justify-items-center gap-4 p-5 text-center">
      {lead.avatar_url || lead.photo_url ? (
        <div className="relative h-32 w-32 overflow-hidden rounded-full bg-zinc-100">
          <Image src={lead.avatar_url || lead.photo_url} alt={`${lead.full_name} photo`} fill sizes="128px" unoptimized className="object-cover" />
        </div>
      ) : (
        <div className={cn("grid h-28 w-28 place-items-center rounded-full text-3xl font-bold", lost ? "bg-red-100 text-red-600" : avatarTone)}>
          {getInitials(lead.full_name)}
        </div>
      )}
      <div className="w-full min-w-0 max-w-full">
        <h2 className="max-w-full text-balance text-xl font-bold leading-tight text-zinc-950 wrap-anywhere">{lead.full_name}</h2>
        <div className="mt-3 flex justify-center">
          <Badge tone={statusTone[lead.status]} className={lost ? "bg-red-600 text-white" : "px-5 py-2 text-sm"}>
            {lead.status}
          </Badge>
        </div>
        <p className="mt-3 text-sm font-semibold text-zinc-500">Added {formatDate(lead.created_at)}</p>
      </div>
      {/* Three action buttons: Call · Edit · Delete */}
      <div className="grid w-full max-w-72 grid-cols-3 gap-2">
        <Action href={`tel:${lead.phone}`} label="Call" icon={Phone} tone="success" />
        <button
          type="button"
          onClick={onRequestEdit}
          className="grid min-h-20 min-w-0 place-items-center rounded-2xl bg-navy/10 px-2 text-sm font-bold text-navy"
        >
          <Edit3 size={22} />
          Edit
        </button>
        <button
          type="button"
          onClick={onRequestDelete}
          className="grid min-h-20 min-w-0 place-items-center rounded-2xl bg-red-50 px-2 text-sm font-bold text-red-600"
        >
          <Trash2 size={22} />
          Delete
        </button>
      </div>
    </Card>
  );
}

function StatusCard({ lead, updating, updateStatus }) {
  const lost = lead.status === "Lost";

  return (
    <Card className="grid w-full max-w-full gap-4">
      <h2 className="text-xl font-bold text-zinc-950">Update Status</h2>
      <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:grid-cols-4">
        {statusOptions.map((option) => {
          const tone = statusButtonTone[option];
          return (
            <button
              key={option}
              type="button"
              disabled={updating}
              onClick={() => updateStatus(option)}
              className={cn(
                "min-h-12 min-w-0 rounded-xl border px-2 text-sm font-bold transition disabled:opacity-60",
                lead.status === option ? tone.active : tone.idle
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={updating}
        onClick={() => updateStatus("Lost")}
        className={cn(
          "min-h-14 rounded-xl text-base font-bold transition disabled:opacity-60",
          lost ? statusButtonTone.Lost.active : "bg-zinc-100 text-zinc-500"
        )}
      >
        Mark as Lost
      </button>
    </Card>
  );
}

function LeadDetailsCard({ lead, project }) {
  return (
    <Card className="grid gap-5">
      <h2 className="text-xl font-bold text-zinc-950">Details</h2>
      <Detail icon={Phone} label="Phone" value={lead.phone} />
      <Detail icon={Tag} label="Source" value={lead.lead_source} />
      <Detail icon={Banknote} label="Budget" value={formatPrice(lead.budget)} />
      <Detail icon={Home} label="Interested In" value={project?.name || "No project"} />
      <Detail icon={MapPin} label="Location" value={lead.location_address || "Not captured"} />
    </Card>
  );
}

function Action({ href, label, icon: Icon, tone }) {
  const color = tone === "success" ? "bg-success/10 text-success" : "bg-zinc-100 text-zinc-600";
  return (
    <a href={href} className={cn("grid min-h-20 min-w-0 place-items-center rounded-2xl px-2 text-sm font-bold", color)}>
      <Icon size={24} />
      {label}
    </a>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="grid grid-cols-[48px_1fr] items-center gap-3">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-zinc-100 text-zinc-500">
        <Icon size={21} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-zinc-500">{label}</p>
        <p className="wrap-break-word text-lg font-semibold text-zinc-950">{value}</p>
      </div>
    </div>
  );
}

function PillGroup({ label, items, value, onChange }) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold text-zinc-700">{label}</span>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-bold transition",
              item === value
                ? "border-navy bg-navy text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-navy/30"
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
