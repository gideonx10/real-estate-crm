"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Download, FolderPlus, Home, Landmark, UserPlus, UsersRound } from "lucide-react";
import { DashboardAccountActions } from "@/components/dashboard/DashboardAccountActions";
import { QuickAction } from "@/components/dashboard/QuickAction";
import { RecentLeadRow } from "@/components/dashboard/RecentLeadRow";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/Card";
import { useCRMData } from "@/lib/use-crm-data";
import { projectMetrics } from "@/lib/utils";

const PortfolioMapPanel = dynamic(
  () => import("@/components/projects/PortfolioMapPanel").then((module) => module.PortfolioMapPanel),
  { ssr: false, loading: () => <div className="h-[520px] animate-pulse rounded-2xl bg-zinc-100" /> }
);

export default function DashboardPage() {
  const data = useCRMData();
  if (!data) return <DashboardSkeleton />;

  const companyName = "Aakarsh Group";
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
  const dashboardProps = { data, companyName, metrics, recentLeads };

  return (
    <>
      <DashboardMobile {...dashboardProps} />
      <DashboardDesktop {...dashboardProps} />
    </>
  );
}

function DashboardMobile({ data, companyName, metrics, recentLeads }) {
  return (
    <div className="grid w-full max-w-full gap-5 md:hidden">
      <div className="grid grid-cols-[auto_1fr] items-center gap-3">
        <Link href="/export" className="grid h-10 w-10 place-items-center rounded-xl bg-white text-gold shadow-sm ring-1 ring-zinc-200" aria-label="Export data">
          <Download size={20} />
        </Link>
        <div className="justify-self-end">
          <DashboardAccountActions />
        </div>
      </div>

      <section className="w-full max-w-full rounded-[28px] bg-navy p-4 text-white shadow-lg shadow-navy/15">
        <div className="flex items-center gap-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm">
            <Image src="/aakarsh-group-logo.png" alt="Aakarsh Group logo" width={64} height={64} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-white/70">Welcome to {companyName}</p>
            <h1 className="text-[1.65rem] font-bold leading-tight">Aakarsh Group</h1>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <BannerStat label="Projects" value={data.projects.length} />
          <BannerStat label="Available" value={metrics.available} />
          <BannerStat label="Sold" value={metrics.sold} />
        </div>
      </section>

      <section className="grid gap-3">
        <MobileStat icon={Building2} label="Total Projects" value={data.projects.length} href="/projects" color="text-navy" />
        <MobileStat icon={Home} label="Available Units" value={metrics.available} href="/projects" color="text-success" />
        <MobileStat icon={Landmark} label="Sold Units" value={metrics.sold} href="/projects" color="text-gold" />
        <MobileStat icon={UsersRound} label="Total Leads" value={data.leads.length} href="/leads" color="text-info" />
      </section>

      <PortfolioOverview data={data} />
      <QuickActionsMobile />
      <ExportCard />
      <RecentLeads data={data} recentLeads={recentLeads} />
    </div>
  );
}

function DashboardDesktop({ data, companyName, metrics, recentLeads }) {
  return (
    <div className="hidden gap-6 md:grid">
      <div className="flex items-center justify-end gap-3">
        <Link href="/export" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 font-bold text-gold shadow-sm ring-1 ring-zinc-200">
          <Download size={19} /> Export
        </Link>
        <DashboardAccountActions />
      </div>

      <section className="rounded-3xl bg-navy p-6 text-white shadow-lg shadow-navy/15">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-3xl bg-white shadow-sm">
              <Image src="/aakarsh-group-logo.png" alt="Aakarsh Group logo" width={80} height={80} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-lg text-white/70">Welcome to {companyName}</p>
              <h1 className="text-4xl font-bold">Aakarsh Group CRM</h1>
            </div>
          </div>
        </div>
        <div className="mt-7 grid grid-cols-3 gap-4 text-center">
          <BannerStat label="Projects" value={data.projects.length} />
          <BannerStat label="Available Units" value={metrics.available} />
          <BannerStat label="Sold Units" value={metrics.sold} />
        </div>
      </section>

      <section className="grid grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Total Projects" value={data.projects.length} href="/projects" color="text-navy" />
        <StatCard icon={Home} label="Available Units" value={metrics.available} href="/projects" color="text-success" />
        <StatCard icon={Landmark} label="Sold Units" value={metrics.sold} href="/projects" color="text-gold" />
        <StatCard icon={UsersRound} label="Total Leads" value={data.leads.length} href="/leads" color="text-info" />
      </section>

      <PortfolioOverview data={data} />
      <QuickActions />
      <ExportCard />
      <RecentLeads data={data} recentLeads={recentLeads} />
    </div>
  );
}

function PortfolioOverview({ data }) {
  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-navy">India Portfolio Map</h2>
        <Link href="/projects" className="text-sm font-bold text-gold">Open Projects</Link>
      </div>
      <PortfolioMapPanel projects={data.projects} builders={data.builders} />
    </section>
  );
}

function BannerStat({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/10 p-3">
      <p className="text-2xl font-bold text-gold">{value}</p>
      <p className="truncate text-xs font-semibold text-white/70">{label}</p>
    </div>
  );
}

function MobileStat({ icon: Icon, label, value, href, color = "text-navy" }) {
  return (
    <Card className="grid min-h-24 grid-cols-[52px_1fr_auto] items-center gap-3">
      <div className={`grid h-12 w-12 place-items-center rounded-xl bg-current/10 ${color}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-bold text-zinc-700">{label}</p>
        <Link href={href} className={`mt-1 inline-flex items-center gap-1 text-sm font-bold ${color}`}>
          View all <ArrowRight size={14} />
        </Link>
      </div>
      <span className="text-3xl font-bold text-navy">{value}</span>
    </Card>
  );
}

function QuickActionsMobile() {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-navy">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        <QuickAction href="/projects/add" icon={FolderPlus} label="Add Project" />
        <QuickAction href="/leads/add" icon={UserPlus} label="Add Lead" />
        <QuickAction href="/contacts/add-builder" icon={Building2} label="Add Builder" />
        <QuickAction href="/contacts/add-broker" icon={UsersRound} label="Add Broker" />
      </div>
    </section>
  );
}

function QuickActions() {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-navy">Quick Actions</h2>
      <div className="grid grid-cols-4 gap-3">
        <QuickAction href="/projects/add" icon={FolderPlus} label="Add Project" />
        <QuickAction href="/leads/add" icon={UserPlus} label="Add Lead" />
        <QuickAction href="/contacts/add-builder" icon={Building2} label="Add Builder" />
        <QuickAction href="/contacts/add-broker" icon={UsersRound} label="Add Broker" />
      </div>
    </section>
  );
}

function ExportCard() {
  return (
    <Card className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h2 className="font-bold text-navy">Export & Sync</h2>
        <p className="mt-1 text-sm font-semibold text-zinc-500">Excel / CSV / Google Sheets / Drive</p>
      </div>
      <Link href="/export" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
        <ArrowRight size={20} />
      </Link>
    </Card>
  );
}

function RecentLeads({ data, recentLeads }) {
  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-navy">Recent Leads</h2>
        <Link href="/leads" className="text-sm font-bold text-gold">See All</Link>
      </div>
      {recentLeads.map((lead) => (
        <RecentLeadRow
          key={lead.id}
          lead={lead}
          project={data.projects.find((project) => project.id === lead.interested_project_id)}
        />
      ))}
    </section>
  );
}

function DashboardSkeleton() {
  return <div className="h-96 animate-pulse rounded-3xl bg-white" />;
}
