"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { createCRMRecord } from "@/lib/crm-client";
import { cn } from "@/lib/utils";

const statuses = ["Active", "Upcoming", "Completed"];

export function AddProjectForm({ builders = [] }) {
  const router = useRouter();
  const [builderId, setBuilderId] = useState("");
  const [addingBuilder, setAddingBuilder] = useState(false);
  const [status, setStatus] = useState("Active");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      let finalBuilderId = builderId || null;
      if (addingBuilder) {
        const companyName = String(form.get("builder_company_name") || "").trim();
        const phone = String(form.get("builder_phone") || "").trim();
        if (!companyName || !phone) {
          throw new Error("Builder company name and phone are required.");
        }
        const builder = await createCRMRecord("builders", {
          full_name: String(form.get("builder_full_name") || companyName).trim(),
          company_name: companyName,
          phone,
          email: String(form.get("builder_email") || "").trim() || null,
          office_address: String(form.get("builder_office_address") || "").trim() || null,
        });
        finalBuilderId = builder.id;
      }

      await createCRMRecord("projects", {
        name: form.get("name"),
        location: form.get("location"),
        description: form.get("description"),
        builder_id: finalBuilderId,
        price_from: Number(form.get("price_from") || 0),
        price_to: Number(form.get("price_to") || 0),
        status,
        amenities,
        total_units: 0,
      });
      router.refresh();
      router.push("/projects");
    } catch (error) {
      setMessage(error.message || "Unable to add project.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedBuilderName = useMemo(
    () => builders.find((builder) => builder.id === builderId)?.company_name,
    [builders, builderId]
  );

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Card className="grid gap-4">
        <Input label="Project Name*" name="name" required placeholder="Emerald Heights" />
        <Input label="Location*" name="location" required placeholder="Sector 150, Noida" />
        <Textarea label="Description" name="description" placeholder="Project positioning, inventory highlights, nearby landmarks..." />

        <div className="grid gap-2">
          <span className="text-sm font-semibold text-zinc-700">Builder</span>
          <div className="flex flex-wrap gap-2">
            <Pill active={!builderId && !addingBuilder} onClick={() => { setBuilderId(""); setAddingBuilder(false); }}>None</Pill>
            {builders.map((builder) => (
              <Pill key={builder.id} active={!addingBuilder && builder.id === builderId} onClick={() => { setBuilderId(builder.id); setAddingBuilder(false); }}>
                {builder.company_name || builder.full_name}
              </Pill>
            ))}
            <Pill active={addingBuilder} onClick={() => { setBuilderId(""); setAddingBuilder(true); }}>
              <Plus size={15} /> New Builder
            </Pill>
          </div>
          {selectedBuilderName && !addingBuilder ? <p className="text-xs font-semibold text-zinc-400">Selected: {selectedBuilderName}</p> : null}
        </div>

        {addingBuilder ? (
          <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-bold text-navy">Add New Builder</p>
            <Input label="Builder Company Name*" name="builder_company_name" required={addingBuilder} placeholder="Mehta Constructions" />
            <Input label="Contact Person" name="builder_full_name" placeholder="Mehta Constructions" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Phone*" name="builder_phone" required={addingBuilder} inputMode="tel" placeholder="9876543210" />
              <Input label="Email" name="builder_email" type="email" placeholder="sales@builder.com" />
            </div>
            <Input label="Office Address" name="builder_office_address" placeholder="Andheri West, Mumbai" />
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Price From (₹)" name="price_from" inputMode="numeric" type="number" min="0" />
          <Input label="Price To (₹)" name="price_to" inputMode="numeric" type="number" min="0" />
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
      </Card>
      {message ? <p className="text-sm font-semibold text-red-600">{message}</p> : null}
      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        <Building2 size={18} /> {submitting ? "Adding Project..." : "Add Project"}
      </Button>
    </form>
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
