"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Banknote, Home, MapPin, Phone, Tag, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { deleteCRMRecord, updateCRMRecord } from "@/lib/crm-client";
import { useCRMData } from "@/lib/use-crm-data";
import { cn, formatDate, formatPrice, getInitials, statusButtonTone, statusTone } from "@/lib/utils";

const statusOptions = ["New", "Contacted", "Site Visit", "Converted"];

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const data = useCRMData();
  const [updating, setUpdating] = useState(false);

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

  async function updateStatus(nextStatus) {
    if (updating || lead.status === nextStatus) return;
    setUpdating(true);
    try {
      await updateCRMRecord("leads", lead.id, { status: nextStatus });
    } finally {
      setUpdating(false);
    }
  }

  async function deleteLead() {
    if (updating) return;
    setUpdating(true);
    try {
      await deleteCRMRecord("leads", lead.id);
      router.push("/leads");
    } finally {
      setUpdating(false);
    }
  }

  const pageProps = { lead, project, updating, updateStatus, deleteLead };

  return (
    <>
      <LeadDetailMobile {...pageProps} />
      <LeadDetailDesktop {...pageProps} />
    </>
  );
}

function LeadDetailMobile({ lead, project, updating, updateStatus, deleteLead }) {
  return (
    <div className="grid w-full max-w-full gap-5 md:hidden">
      <header className="sticky top-0 z-20 -mx-4 grid grid-cols-[auto_1fr] items-center gap-3 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
        <Button href="/leads" variant="secondary" className="rounded-full px-4" aria-label="Back to leads">
          <ArrowLeft size={19} /> Back
        </Button>
        <h1 className="min-w-0 truncate text-base font-bold text-navy">{lead.full_name}</h1>
      </header>

      <LeadHeroCard lead={lead} deleteLead={deleteLead} />
      <StatusCard lead={lead} updating={updating} updateStatus={updateStatus} />
      <LeadDetailsCard lead={lead} project={project} />
    </div>
  );
}

function LeadDetailDesktop({ lead, project, updating, updateStatus, deleteLead }) {
  return (
    <div className="hidden gap-6 md:grid">
      <header className="flex items-center justify-between">
        <Button href="/leads" variant="secondary" className="rounded-full" aria-label="Back to leads">
          <ArrowLeft size={19} /> Back to Leads
        </Button>
        <h1 className="text-2xl font-bold text-navy">{lead.full_name}</h1>
        <div className="w-32" />
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <LeadHeroCard lead={lead} deleteLead={deleteLead} />
        <LeadDetailsCard lead={lead} project={project} />
      </div>
      <StatusCard lead={lead} updating={updating} updateStatus={updateStatus} />
    </div>
  );
}

function LeadHeroCard({ lead, deleteLead }) {
  const lost = lead.status === "Lost";
  const avatarTone = statusButtonTone[lead.status]?.avatar || "bg-zinc-100 text-zinc-700";

  return (
    <Card className="grid w-full max-w-full justify-items-center gap-4 p-5 text-center">
      {lead.photo_url ? (
        <div className="relative h-32 w-32 overflow-hidden rounded-full bg-zinc-100">
          <Image src={lead.photo_url} alt={`${lead.full_name} photo`} fill sizes="128px" className="object-cover" />
        </div>
      ) : (
        <div className={cn("grid h-28 w-28 place-items-center rounded-full text-3xl font-bold", lost ? "bg-red-100 text-red-600" : avatarTone)}>
          {getInitials(lead.full_name)}
        </div>
      )}
      <div className="w-full min-w-0 max-w-full">
        <h2 className="max-w-full text-balance text-xl font-bold leading-tight text-zinc-950 [overflow-wrap:anywhere]">{lead.full_name}</h2>
        <div className="mt-3 flex justify-center">
          <Badge tone={statusTone[lead.status]} className={lost ? "bg-red-600 text-white" : "px-5 py-2 text-sm"}>
            {lead.status}
          </Badge>
        </div>
        <p className="mt-3 text-sm font-semibold text-zinc-500">Added {formatDate(lead.created_at)}</p>
      </div>
      <div className="grid w-full max-w-64 grid-cols-2 gap-3">
        <Action href={`tel:${lead.phone}`} label="Call" icon={Phone} tone="success" />
        <button
          type="button"
          onClick={deleteLead}
          className="grid min-h-20 min-w-20 place-items-center rounded-2xl bg-red-50 px-4 text-sm font-bold text-red-600"
        >
          <Trash2 size={24} />
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
    <a href={href} className={cn("grid min-h-20 min-w-20 place-items-center rounded-2xl px-4 text-sm font-bold", color)}>
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
        <p className="break-words text-lg font-semibold text-zinc-950">{value}</p>
      </div>
    </div>
  );
}
