"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { LeadCard } from "@/components/leads/LeadCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCRMData } from "@/lib/use-crm-data";
import { cn } from "@/lib/utils";

const statuses = ["All", "New", "Contacted", "Site Visit", "Converted", "Lost"];

export default function LeadsPage() {
  const data = useCRMData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const leads = useMemo(() => {
    if (!data) return [];
    return data.leads.filter((lead) => {
      const matchesStatus = status === "All" || lead.status === status;
      const matchesQuery = `${lead.full_name} ${lead.phone}`.toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [data, query, status]);

  if (!data) return null;
  const newCount = data.leads.filter((lead) => lead.status === "New").length;

  return (
    <div className="grid gap-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">Leads</h1>
          <p className="text-sm font-semibold text-zinc-500">{data.leads.length} total · {newCount} new</p>
        </div>
        <Button href="/leads/add" size="icon" aria-label="Add lead">
          <Plus size={21} />
        </Button>
      </header>

      <Input aria-label="Search leads" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or phone..." />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {statuses.map((item) => {
          const count = item === "All" ? data.leads.length : data.leads.filter((lead) => lead.status === item).length;
          return (
            <button
              key={item}
              onClick={() => setStatus(item)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold",
                status === item ? "bg-navy text-white" : "bg-white text-zinc-600"
              )}
            >
              {item} {count ? `(${count})` : ""}
            </button>
          );
        })}
      </div>

      <section className="grid gap-3">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            project={data.projects.find((project) => project.id === lead.interested_project_id)}
          />
        ))}
      </section>
    </div>
  );
}
