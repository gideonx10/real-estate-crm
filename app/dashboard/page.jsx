"use client";

import Link from "next/link";
import { ArrowRight, Building2, Download, FolderPlus, Home, Landmark, UserPlus, UsersRound } from "lucide-react";
import { QuickAction } from "@/components/dashboard/QuickAction";
import { RecentLeadRow } from "@/components/dashboard/RecentLeadRow";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/Card";
import { useCRMData } from "@/lib/use-crm-data";
import { projectMetrics } from "@/lib/utils";

export default function DashboardPage() {
  const data = useCRMData();
  if (!data) return <DashboardSkeleton />;

  const company = data.companies[0];
  const metrics = data.projects.reduce(
    (acc, project) => {
      const item = projectMetrics(project, data.units);
      acc.available += item.available;
      acc.sold += item.sold;
      return acc;
    },
    { available: 0, sold: 0 }
  );
  const recentLeads = [...data.leads]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl bg-navy p-5 text-white shadow-lg shadow-navy/15">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gold text-lg font-bold text-navy">
              {company.initials}
            </div>
            <div>
              <p className="text-sm text-white/70">Welcome to {company.name}</p>
              <h1 className="text-2xl font-bold">Real Estate CRM</h1>
            </div>
          </div>
          <Link href="/export" className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-gold">
            <Download size={21} />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <BannerStat label="Projects" value={data.projects.length} />
          <BannerStat label="Available Units" value={metrics.available} />
          <BannerStat label="Sold Units" value={metrics.sold} />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <StatCard icon={Building2} label="Total Projects" value={data.projects.length} href="/projects" color="text-navy" />
        <StatCard icon={Home} label="Available Units" value={metrics.available} href="/projects" color="text-success" />
        <StatCard icon={Landmark} label="Sold Units" value={metrics.sold} href="/projects" color="text-gold" />
        <StatCard icon={UsersRound} label="Total Leads" value={data.leads.length} href="/leads" color="text-info" />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-navy">Quick Actions</h2>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          <QuickAction href="/projects/add" icon={FolderPlus} label="Add Project" />
          <QuickAction href="/leads/add" icon={UserPlus} label="Add Lead" />
          <QuickAction href="/contacts/add-builder" icon={Building2} label="Add Builder" />
          <QuickAction href="/contacts/add-broker" icon={UsersRound} label="Add Broker" />
        </div>
      </section>

      <Card className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-navy">Export & Sync</h2>
          <p className="mt-1 text-sm font-semibold text-zinc-500">Excel · CSV · Google Sheets · Drive</p>
        </div>
        <Link href="/export" className="grid h-11 w-11 place-items-center rounded-xl bg-gold/15 text-gold">
          <ArrowRight size={20} />
        </Link>
      </Card>

      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy">Recent Leads</h2>
          <Link href="/leads" className="text-sm font-bold text-gold">See All →</Link>
        </div>
        {recentLeads.map((lead) => (
          <RecentLeadRow
            key={lead.id}
            lead={lead}
            project={data.projects.find((project) => project.id === lead.interested_project_id)}
          />
        ))}
      </section>
    </div>
  );
}

function BannerStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <p className="text-2xl font-bold text-gold">{value}</p>
      <p className="text-xs font-semibold text-white/70">{label}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return <div className="h-96 animate-pulse rounded-3xl bg-white" />;
}
