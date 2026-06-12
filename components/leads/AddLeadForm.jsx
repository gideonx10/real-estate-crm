"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, LocateFixed, MapPin, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { uploadLeadAvatar } from "@/app/actions/cloudinary";
import { createCRMRecord } from "@/lib/crm-client";
import { cn } from "@/lib/utils";

const sources = ["Walk-in", "Broker", "Online", "Referral", "Other"];
const statuses = ["New", "Contacted", "Site Visit", "Converted", "Lost"];
const locationCacheKey = "crm-lead-draft-location";
const LeadLocationPicker = dynamic(
  () => import("@/components/leads/LeadLocationPicker").then((mod) => mod.LeadLocationPicker),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-2xl bg-zinc-100" />,
  }
);

export function AddLeadForm({ projects = [] }) {
  const router = useRouter();
  const [source, setSource] = useState("Walk-in");
  const [status, setStatus] = useState("New");
  const [projectId, setProjectId] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [coords, setCoords] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("Location permission needed");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const cached = readCachedLocation();
    if (cached) {
      queueMicrotask(() => {
        setCoords(cached);
        setGpsStatus("Cached location ready");
      });
      return;
    }

    if (!navigator.geolocation) {
      queueMicrotask(() => setGpsStatus("GPS unavailable in this browser"));
    }
  }, []);

  useEffect(() => {
    if (!coords) {
      return;
    }
    window.sessionStorage.setItem(locationCacheKey, JSON.stringify(coords));
  }, [coords]);

  function requestLocation() {
    if (!navigator.geolocation) {
      setGpsStatus("GPS unavailable in this browser");
      return;
    }
    setGpsStatus("Requesting location permission...");
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
  }

  function handleMapLocation(nextCoords) {
    setCoords(nextCoords);
    setGpsStatus("Map location selected");
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoName(file.name);
    setPhotoFile(file);
    setUploadError("");
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    if (uploadingPhoto) return;
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const phone = String(form.get("phone") || "").trim();

    try {
      const lead = await createCRMRecord("leads", {
        full_name: form.get("full_name"),
        phone: phone.startsWith("+91") ? phone : `+91 ${phone}`,
        email: form.get("email"),
        lead_source: source,
        broker_id: null,
        budget: Number(form.get("budget") || 0),
        interested_project_id: projectId || null,
        status,
        notes: form.get("notes"),
        photo_url: "",
        latitude: coords?.latitude || null,
        longitude: coords?.longitude || null,
        location_address: coords ? `${coords.latitude}, ${coords.longitude}` : "",
      });
      if (photoFile) {
        setUploadingPhoto(true);
        const uploadForm = new FormData();
        uploadForm.set("leadId", lead.id);
        uploadForm.set("file", photoFile);
        const upload = await uploadLeadAvatar(uploadForm);
        if (!upload.ok) throw new Error(upload.error || "Lead photo upload failed");
      }
      window.sessionStorage.removeItem(locationCacheKey);
      router.refresh();
      router.push("/leads");
    } catch (error) {
      setUploadError(error.message || "Unable to add lead");
    } finally {
      setUploadingPhoto(false);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Card className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-3 text-center text-sm font-bold text-navy">
            {photoPreview ? (
              <Image src={photoPreview} alt="Lead upload preview" width={420} height={160} unoptimized className="h-28 w-full rounded-xl object-cover" />
            ) : uploadingPhoto ? (
              <UploadCloud size={26} />
            ) : (
              <Camera size={24} />
            )}
            <span className="max-w-full truncate">
              {uploadingPhoto ? "Uploading photo..." : photoName || "Capture / upload photo"}
            </span>
            {photoFile ? <span className="text-xs text-success">Photo ready</span> : null}
            {uploadError ? <span className="text-xs text-red-600">{uploadError}</span> : null}
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
            />
          </label>
          <div className="flex min-h-28 flex-col justify-center rounded-2xl border border-success/20 bg-success/10 p-4 text-success">
            <div className="flex items-center gap-2 font-bold">
              <LocateFixed size={20} /> {gpsStatus}
            </div>
            <p className="mt-2 text-sm font-semibold text-zinc-600">
              {coords ? `${coords.latitude}, ${coords.longitude}` : "Coordinates will be stored with the lead."}
            </p>
            <Button type="button" size="sm" className="mt-3 w-fit" onClick={requestLocation}>
              <MapPin size={16} /> Allow Location
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <span className="text-sm font-semibold text-zinc-700">Map Location</span>
          <LeadLocationPicker coords={coords} onChange={handleMapLocation} />
          <p className="text-xs font-semibold text-zinc-500">Tap the map to set or adjust the lead location.</p>
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
      <Button type="submit" className="w-full" size="lg" disabled={submitting || uploadingPhoto}>
        <Check size={18} /> {submitting ? "Adding Lead..." : uploadingPhoto ? "Uploading Photo..." : "Add Lead"}
      </Button>
    </form>
  );
}

function readCachedLocation() {
  if (typeof window === "undefined") return null;
  try {
    const cached = window.sessionStorage.getItem(locationCacheKey);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
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
