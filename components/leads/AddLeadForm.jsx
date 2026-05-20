"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { createCRMRecord } from "@/lib/crm-client";
import { cn } from "@/lib/utils";

const sources = ["Walk-in", "Broker", "Online", "Referral", "Other"];
const statuses = ["New", "Contacted", "Site Visit", "Converted", "Lost"];

export function AddLeadForm({ projects = [] }) {
  const router = useRouter();
  const [source, setSource] = useState("Walk-in");
  const [status, setStatus] = useState("New");
  const [projectId, setProjectId] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [coords, setCoords] = useState(null);
  const [gpsStatus, setGpsStatus] = useState(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return "GPS unavailable in this browser";
    }
    return "Detecting location...";
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: Number(position.coords.latitude.toFixed(7)),
          longitude: Number(position.coords.longitude.toFixed(7)),
        });
        setGpsStatus("Live GPS captured");
      },
      () => setGpsStatus("GPS permission not granted"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phone = String(form.get("phone") || "").trim();

    await createCRMRecord("leads", {
      full_name: form.get("full_name"),
      phone: phone.startsWith("+91") ? phone : `+91 ${phone}`,
      email: form.get("email"),
      lead_source: source,
      broker_id: null,
      budget: Number(form.get("budget") || 0),
      interested_project_id: projectId || null,
      status,
      notes: form.get("notes"),
      photo_url: photoName,
      latitude: coords?.latitude || null,
      longitude: coords?.longitude || null,
      location_address: coords ? `${coords.latitude}, ${coords.longitude}` : "",
    });
    router.refresh();
    router.push("/leads");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Card className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 text-center text-sm font-bold text-navy">
            <Camera size={24} />
            <span>{photoName || "Capture / upload photo"}</span>
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(event) => setPhotoName(event.target.files?.[0]?.name || "")}
            />
          </label>
          <div className="flex min-h-28 flex-col justify-center rounded-2xl border border-success/20 bg-success/10 p-4 text-success">
            <div className="flex items-center gap-2 font-bold">
              <LocateFixed size={20} /> {gpsStatus}
            </div>
            <p className="mt-2 text-sm font-semibold text-zinc-600">
              {coords ? `${coords.latitude}, ${coords.longitude}` : "Coordinates will be stored with the lead."}
            </p>
          </div>
        </div>

        <Input label="Full Name*" name="full_name" required placeholder="Customer name" />
        <Input label="Phone Number*" name="phone" required inputMode="tel" placeholder="+91 98765 43210" />
        <Input label="Email" name="email" type="email" placeholder="customer@example.com" />

        <PillGroup label="Lead Source" items={sources} value={source} onChange={setSource} />
        <Input label="Budget (₹)" name="budget" type="number" min="0" inputMode="numeric" />

        <div className="grid gap-2">
          <span className="text-sm font-semibold text-zinc-700">Interested Project</span>
          <div className="flex flex-wrap gap-2">
            <Pill active={!projectId} onClick={() => setProjectId("")}>None</Pill>
            {projects.map((project) => (
              <Pill key={project.id} active={project.id === projectId} onClick={() => setProjectId(project.id)}>
                {project.name}
              </Pill>
            ))}
          </div>
        </div>

        <PillGroup label="Status" items={statuses} value={status} onChange={setStatus} />
        <Textarea label="Notes" name="notes" placeholder="Requirements, next follow-up, site visit preferences..." />
      </Card>
      <Button type="submit" className="w-full" size="lg">
        <Check size={18} /> Add Lead
      </Button>
    </form>
  );
}

function PillGroup({ label, items, value, onChange }) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold text-zinc-700">{label}</span>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Pill key={item} active={item === value} onClick={() => onChange(item)}>
            {item}
          </Pill>
        ))}
      </div>
    </div>
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
