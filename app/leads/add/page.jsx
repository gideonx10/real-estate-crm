"use client";

import { ArrowLeft } from "lucide-react";
import { AddLeadForm } from "@/components/leads/AddLeadForm";
import { Button } from "@/components/ui/Button";
import { useCRMData } from "@/lib/use-crm-data";

export default function AddLeadPage() {
  const data = useCRMData();

  return (
    <div className="grid gap-5">
      <header className="flex items-center gap-3">
        <Button href="/leads" variant="secondary" size="icon" aria-label="Back to leads">
          <ArrowLeft size={19} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-navy">Add Lead</h1>
          <p className="text-sm font-semibold text-zinc-500">Capture enquiry details with GPS</p>
        </div>
      </header>
      <AddLeadForm projects={data?.projects || []} />
    </div>
  );
}
