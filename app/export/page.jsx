"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useCRMData } from "@/lib/use-crm-data";

const exportRows = [
  { key: "all", label: "All Data", description: "4 sheets: Builders, Projects, Brokers & Leads" },
  { key: "builders", label: "Builders", description: "Builder brand and contact records" },
  { key: "projects", label: "Projects", description: "Project details, pricing and status" },
  { key: "brokers", label: "Brokers", description: "Broker contacts and commission rates" },
  { key: "leads", label: "Leads", description: "Lead pipeline, GPS and project interest" },
];

export default function ExportPage() {
  const data = useCRMData();
  if (!data) return null;

  const totalRecords = data.builders.length + data.projects.length + data.brokers.length + data.leads.length;

  function downloadWorkbook(key) {
    const workbook = XLSX.utils.book_new();
    const collections =
      key === "all"
        ? ["builders", "projects", "brokers", "leads"]
        : [key];

    collections.forEach((collection) => {
      const rows = normalizeRows(collection, data[collection] || [], data);
      const sheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, sheet, titleCase(collection));
    });

    XLSX.writeFile(workbook, `real-estate-crm-${key}-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  function downloadCsv(key) {
    const collections =
      key === "all"
        ? ["builders", "projects", "brokers", "leads"]
        : [key];

    const csv = collections
      .map((collection) => {
        const rows = normalizeRows(collection, data[collection] || [], data);
        const sheet = XLSX.utils.json_to_sheet(rows);
        return [`# ${titleCase(collection)}`, XLSX.utils.sheet_to_csv(sheet)].join("\n");
      })
      .join("\n\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `real-estate-crm-${key}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-3xl bg-navy p-5 text-white shadow-lg shadow-navy/15">
        <p className="text-sm font-semibold text-white/70">{data.companies[0]?.name || "Company"}</p>
        <h1 className="mt-1 text-2xl font-bold">Export & Sync</h1>
        <div className="mt-5 grid grid-cols-4 gap-2 text-center">
          <BannerStat label="Builders" value={data.builders.length} />
          <BannerStat label="Projects" value={data.projects.length} />
          <BannerStat label="Brokers" value={data.brokers.length} />
          <BannerStat label="Leads" value={data.leads.length} />
        </div>
        <p className="mt-4 text-sm font-semibold text-gold">{totalRecords} total records ready to export</p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-bold text-navy">Download Data</h2>
        {exportRows.map((row) => {
          const count = row.key === "all" ? totalRecords : data[row.key]?.length || 0;
          return (
            <Card key={row.key} className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-navy">{row.label}</h3>
                <p className="text-sm font-semibold text-zinc-500">
                  {row.description} · {count} records
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="icon" aria-label={`Download ${row.label} Excel`} onClick={() => downloadWorkbook(row.key)}>
                  <FileSpreadsheet size={18} />
                </Button>
                <Button size="icon" variant="secondary" aria-label={`Download ${row.label} CSV`} onClick={() => downloadCsv(row.key)}>
                  <Download size={18} />
                </Button>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

function normalizeRows(collection, rows, data) {
  if (collection === "projects") {
    return rows.map((project) => ({
      ...project,
      builder_name: data.builders.find((builder) => builder.id === project.builder_id)?.company_name || "",
      amenities: (project.amenities || []).join(", "),
    }));
  }

  if (collection === "leads") {
    return rows.map((lead) => ({
      ...lead,
      interested_project: data.projects.find((project) => project.id === lead.interested_project_id)?.name || "",
      broker: data.brokers.find((broker) => broker.id === lead.broker_id)?.full_name || "",
    }));
  }

  return rows;
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function BannerStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <p className="text-xl font-bold text-gold">{value}</p>
      <p className="text-[11px] font-semibold text-white/70">{label}</p>
    </div>
  );
}
