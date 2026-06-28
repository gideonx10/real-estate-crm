"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus } from "lucide-react";
import { QuickBuilderForm } from "@/components/contacts/QuickBuilderForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createCRMRecord } from "@/lib/crm-client";
import { cn } from "@/lib/utils";

const statuses = ["Active", "Upcoming", "Completed"];
const LocationPicker = dynamic(
  () => import("@/components/maps/LocationPicker").then((module) => module.LocationPicker),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-xl bg-zinc-100" /> }
);

export function AddProjectForm({ builders = [] }) {
  const router = useRouter();
  const [addedBuilders, setAddedBuilders] = useState([]);
  const [builderId, setBuilderId] = useState("");
  const [builderModalOpen, setBuilderModalOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("Active");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const availableBuilders = useMemo(() => {
    const records = new Map();
    [...builders, ...addedBuilders].forEach((builder) => records.set(builder.id, builder));
    return [...records.values()].sort((a, b) =>
      String(a.company_name || a.full_name).localeCompare(String(b.company_name || b.full_name))
    );
  }, [addedBuilders, builders]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const amenities = String(form.get("amenities") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      await createCRMRecord("projects", {
        name: String(form.get("name") || "").trim(),
        location: String(form.get("location") || "").trim(),
        description: String(form.get("description") || "").trim(),
        builder_id: builderId || null,
        price_from: Number(form.get("price_from") || 0),
        price_to: Number(form.get("price_to") || 0),
        status,
        amenities,
        total_units: 0,
        latitude: coords?.latitude || null,
        longitude: coords?.longitude || null,
      });
      router.push("/projects");
    } catch (error) {
      setMessage(error.message || "Unable to add project.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBuilderCreated(builder) {
    setAddedBuilders((current) => [...current, builder]);
    setBuilderId(builder.id);
    setBuilderModalOpen(false);
    setMessage(`${builder.company_name || builder.full_name} added and selected.`);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <Card className="grid gap-4">
          <Input label="Project Name*" name="name" required placeholder="Emerald Heights" />
          <Input label="Location*" name="location" required placeholder="Sector 150, Noida" />
          <Textarea label="Description" name="description" placeholder="Project positioning, inventory highlights, nearby landmarks..." />

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-zinc-700">Builder</span>
              <Button type="button" size="sm" variant="secondary" onClick={() => setBuilderModalOpen(true)}>
                <Plus size={16} /> Add Builder
              </Button>
            </div>
            <select
              value={builderId}
              onChange={(event) => setBuilderId(event.target.value)}
              className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-950 outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
            >
              <option value="">No builder assigned</option>
              {availableBuilders.map((builder) => (
                <option key={builder.id} value={builder.id}>
                  {builder.company_name || builder.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Price From (INR)" name="price_from" inputMode="numeric" type="number" min="0" />
            <Input label="Price To (INR)" name="price_to" inputMode="numeric" type="number" min="0" />
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-700">Status</span>
            <div className="flex flex-wrap gap-2">
              {statuses.map((item) => (
                <Pill key={item} active={item === status} onClick={() => setStatus(item)}>
                  {item}
                </Pill>
              ))}
            </div>
          </div>

          <Input label="Amenities" name="amenities" placeholder="Clubhouse, Pool, Gym" />

          <div className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-700">Map Position</span>
            <LocationPicker coords={coords} onChange={setCoords} />
            <p className="text-xs font-semibold text-zinc-500">
              Tap the map to place the project in the geographic overview.
            </p>
          </div>
        </Card>
        {message ? <p className="text-sm font-semibold text-zinc-600">{message}</p> : null}
        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          <Building2 size={18} /> {submitting ? "Adding Project..." : "Add Project"}
        </Button>
      </form>

      <Modal open={builderModalOpen} title="Add Builder" onClose={() => setBuilderModalOpen(false)}>
        <QuickBuilderForm onCreated={handleBuilderCreated} />
      </Modal>
    </>
  );
}

function Pill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition",
        active ? "border-navy bg-navy text-white" : "border-zinc-200 bg-white text-zinc-600 hover:border-navy/30"
      )}
    >
      {children}
    </button>
  );
}
