"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { createCRMRecord } from "@/lib/crm-client";

const LocationPicker = dynamic(
  () => import("@/components/maps/LocationPicker").then((module) => module.LocationPicker),
  { ssr: false, loading: () => <div className="h-52 animate-pulse rounded-xl bg-zinc-100" /> }
);

export function QuickBuilderForm({ onCreated }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const companyName = String(form.get("company_name") || "").trim();
      const builder = await createCRMRecord("builders", {
        company_name: companyName,
        full_name: String(form.get("full_name") || companyName).trim(),
        phone: String(form.get("phone") || "").trim(),
        email: String(form.get("email") || "").trim() || null,
        office_address: String(form.get("office_address") || "").trim() || null,
        brand_color: "#0D1B3E",
        latitude: coords?.latitude || null,
        longitude: coords?.longitude || null,
      });
      onCreated?.(builder);
    } catch (submitError) {
      setError(submitError.message || "Unable to add builder.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Input label="Builder / Brand Name*" name="company_name" required placeholder="Mehta Constructions" />
      <Input label="Contact Person" name="full_name" placeholder="Primary contact name" />
      <Input label="Phone*" name="phone" required inputMode="tel" placeholder="+91 98765 43210" />
      <Input label="Email" name="email" type="email" placeholder="sales@builder.com" />
      <Textarea label="Office Address" name="office_address" placeholder="Area, city, state" />
      <div className="grid gap-2">
        <span className="text-sm font-semibold text-zinc-700">Map Position</span>
        <LocationPicker coords={coords} onChange={setCoords} className="h-52" />
      </div>
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        <Building2 size={18} /> {submitting ? "Adding Builder..." : "Add Builder"}
      </Button>
    </form>
  );
}
