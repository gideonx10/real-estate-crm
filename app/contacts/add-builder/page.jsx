"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { createCRMRecord } from "@/lib/crm-client";
import { cn } from "@/lib/utils";

const colors = ["#0D1B3E", "#C9A84C", "#22C55E", "#F59E0B", "#3B82F6", "#7C3AED", "#DC2626", "#0F766E"];

export default function AddBuilderPage() {
  const router = useRouter();
  const [brandColor, setBrandColor] = useState("#0D1B3E");
  const [logoName, setLogoName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      await createCRMRecord("builders", {
        full_name: form.get("full_name"),
        company_name: form.get("company_name"),
        legal_name: form.get("legal_name"),
        brand_tagline: form.get("brand_tagline"),
        brand_color: brandColor,
        logo_url: logoName,
        website: form.get("website"),
        established_year: Number(form.get("established_year") || 0),
        phone: form.get("phone"),
        email: form.get("email"),
        office_address: form.get("office_address"),
        notes: form.get("notes"),
      });
      router.refresh();
      router.push("/contacts");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-5">
      <header className="flex items-center gap-3">
        <Button href="/contacts" variant="secondary" size="icon" aria-label="Back to contacts">
          <ArrowLeft size={19} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-navy">Add Builder</h1>
          <p className="text-sm font-semibold text-zinc-500">Brand identity and contact details</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <Card className="grid gap-4">
          <h2 className="font-bold text-navy">Brand Identity</h2>
          <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 text-center text-sm font-bold text-navy">
            <Camera size={24} />
            <span>{logoName || "Upload brand logo"}</span>
            <input className="sr-only" type="file" accept="image/*" onChange={(event) => setLogoName(event.target.files?.[0]?.name || "")} />
          </label>
          <Input label="Brand Name" name="company_name" placeholder="Urban Vista Developers" />
          <Input label="Brand Tagline" name="brand_tagline" placeholder="Premium living, planned precisely" />
          <div className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-700">Brand Color</span>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Select ${color}`}
                  onClick={() => setBrandColor(color)}
                  className={cn("h-9 w-9 rounded-full border-4", brandColor === color ? "border-navy" : "border-white")}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <Input label="Website URL" name="website" type="url" placeholder="https://builder.example" />
          <Input label="Established Year" name="established_year" type="number" inputMode="numeric" />
        </Card>

        <Card className="grid gap-4">
          <h2 className="font-bold text-navy">Contact Details</h2>
          <Input label="Full Name*" name="full_name" required placeholder="Contact person" />
          <Input label="Company / Legal Name" name="legal_name" placeholder="Legal entity name" />
          <Input label="Phone Number*" name="phone" required inputMode="tel" placeholder="+91 98765 43210" />
          <Input label="Email" name="email" type="email" placeholder="builder@example.com" />
          <Textarea label="Office Address" name="office_address" />
          <Textarea label="Notes" name="notes" />
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          <Check size={18} /> {submitting ? "Adding Builder..." : "Add Builder"}
        </Button>
      </form>
    </div>
  );
}
