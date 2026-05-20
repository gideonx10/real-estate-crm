"use client";

import { ArrowLeft } from "lucide-react";
import { AddProjectForm } from "@/components/projects/AddProjectForm";
import { Button } from "@/components/ui/Button";
import { useCRMData } from "@/lib/use-crm-data";

export default function AddProjectPage() {
  const data = useCRMData();

  return (
    <div className="grid gap-5">
      <header className="flex items-center gap-3">
        <Button href="/projects" variant="secondary" size="icon" aria-label="Back to projects">
          <ArrowLeft size={19} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-navy">Add Project</h1>
          <p className="text-sm font-semibold text-zinc-500">Create a new project record</p>
        </div>
      </header>
      <AddProjectForm builders={data?.builders || []} />
    </div>
  );
}
