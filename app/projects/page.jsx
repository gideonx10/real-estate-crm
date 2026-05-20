"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCRMData } from "@/lib/use-crm-data";
import { cn } from "@/lib/utils";

const tabs = ["All", "Active", "Upcoming", "Completed"];

export default function ProjectsPage() {
  const data = useCRMData();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("All");

  const projects = useMemo(() => {
    if (!data) return [];
    return data.projects.filter((project) => {
      const matchesTab = tab === "All" || project.status === tab;
      const matchesQuery = `${project.name} ${project.location}`.toLowerCase().includes(query.toLowerCase());
      return matchesTab && matchesQuery;
    });
  }, [data, query, tab]);

  if (!data) return null;

  return (
    <div className="grid gap-5">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-navy">Projects</h1>
        <Button href="/projects/add" size="icon" aria-label="Add project">
          <Plus size={21} />
        </Button>
      </header>

      <Input aria-label="Search projects" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-bold",
              tab === item ? "bg-navy text-white" : "bg-white text-zinc-600"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            units={data.units}
            builder={data.builders.find((builder) => builder.id === project.builder_id)}
          />
        ))}
      </section>
    </div>
  );
}
