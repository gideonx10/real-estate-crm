"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createCRMRecord } from "@/lib/crm-client";

const LocationPicker = dynamic(
  () => import("@/components/maps/LocationPicker").then((module) => module.LocationPicker),
  { ssr: false, loading: () => <div className="h-56 animate-pulse rounded-xl bg-zinc-100" /> }
);

export function QuickProjectForm({ builders = [], initialBuilderId = "", onCreated }) {
  const [builderId, setBuilderId] = useState(initialBuilderId);
  const [coords, setCoords] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const project = await createCRMRecord("projects", {
        name: String(form.get("name") || "").trim(),
        location: String(form.get("location") || "").trim(),
        builder_id: builderId || null,
        price_from: Number(form.get("price_from") || 0),
        price_to: Number(form.get("price_to") || 0),
        status: "Active",
        amenities: [],
        total_units: 0,
        latitude: coords?.latitude || null,
        longitude: coords?.longitude || null,
      });
      onCreated?.(project);
    } catch (submitError) {
      setError(submitError.message || "Unable to add project.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Input label="Project Name*" name="name" required placeholder="Emerald Heights" />
      <Input label="Location*" name="location" required placeholder="Area, city, state" />
      <label className="grid gap-2 text-sm font-semibold text-zinc-700">
        Builder
        <select
          value={builderId}
          onChange={(event) => setBuilderId(event.target.value)}
          className="h-12 rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-950 outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
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
        <Input label="Price From" name="price_from" type="number" inputMode="numeric" min="0" />
        <Input label="Price To" name="price_to" type="number" inputMode="numeric" min="0" />
      </div>
      <div className="grid gap-2">
        <span className="text-sm font-semibold text-zinc-700">Map Position</span>
        <LocationPicker coords={coords} onChange={setCoords} className="h-56" />
        <p className="text-xs font-semibold text-zinc-500">Tap the map to place this project.</p>
      </div>
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        <Building2 size={18} /> {submitting ? "Adding Project..." : "Add Project"}
      </Button>
    </form>
  );
}
