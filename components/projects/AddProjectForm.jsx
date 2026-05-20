"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { createCRMRecord } from "@/lib/crm-client";
import { cn } from "@/lib/utils";

const statuses = ["Active", "Upcoming", "Completed"];

export function AddProjectForm({ builders = [] }) {
  const router = useRouter();
  const [builderId, setBuilderId] = useState("");
  const [status, setStatus] = useState("Active");

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const amenities = String(form.get("amenities") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    await createCRMRecord("projects", {
      name: form.get("name"),
      location: form.get("location"),
      description: form.get("description"),
      builder_id: builderId || null,
      price_from: Number(form.get("price_from") || 0),
      price_to: Number(form.get("price_to") || 0),
      status,
      amenities,
      total_units: 0,
    });
    router.refresh();
    router.push("/projects");
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
            <Pill active={!builderId} onClick={() => setBuilderId("")}>None</Pill>
            {builders.map((builder) => (
              <Pill key={builder.id} active={builder.id === builderId} onClick={() => setBuilderId(builder.id)}>
                {builder.company_name || builder.full_name}
              </Pill>
            ))}
          </div>
          {selectedBuilderName ? <p className="text-xs font-semibold text-zinc-400">Selected: {selectedBuilderName}</p> : null}
        </div>

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
      <Button type="submit" className="w-full" size="lg">
        <Building2 size={18} /> Add Project
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
        "rounded-full border px-4 py-2 text-sm font-bold transition",
        active ? "border-navy bg-navy text-white" : "border-zinc-200 bg-white text-zinc-600 hover:border-navy/30"
      )}
    >
      {children}
    </button>
  );
}
