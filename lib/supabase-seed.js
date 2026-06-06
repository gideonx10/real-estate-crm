import { initialData } from "@/lib/sample-data";

const idMap = {
  "company-aakash": "00000000-0000-4000-8000-000000000001",
  "builder-urban": "00000000-0000-4000-8000-000000000101",
  "builder-skyline": "00000000-0000-4000-8000-000000000102",
  "broker-aman": "00000000-0000-4000-8000-000000000201",
  "broker-ria": "00000000-0000-4000-8000-000000000202",
  "project-emerald": "00000000-0000-4000-8000-000000000301",
  "project-aurum": "00000000-0000-4000-8000-000000000302",
  "project-celeste": "00000000-0000-4000-8000-000000000303",
  "lead-priya": "00000000-0000-4000-8000-000000000401",
  "lead-karan": "00000000-0000-4000-8000-000000000402",
  "lead-sana": "00000000-0000-4000-8000-000000000403",
  "app-user-axay": "00000000-0000-4000-8000-000000000701",
  "app-user-axay2": "00000000-0000-4000-8000-000000000702",
};

initialData.units.forEach((unit, index) => {
  idMap[unit.id] = `00000000-0000-4000-8000-${String(501 + index).padStart(12, "0")}`;
});

function mapId(value) {
  return value ? idMap[value] || value : value;
}

function normalizeRows(collection) {
  if (collection === "app_users") {
    return [
      {
        id: idMap["app-user-axay"],
        name: "Axay",
        username: "admin@axay",
        password: "axaykhokhar",
        role: "admin",
        is_active: true,
      },
      {
        id: idMap["app-user-axay2"],
        name: "Axay2",
        username: "gideonx10",
        password: "jaimataji",
        role: "admin",
        is_active: true,
      },
    ];
  }

  return (initialData[collection] || []).map((row) => ({
    ...row,
    id: mapId(row.id),
    company_id: mapId(row.company_id),
    builder_id: mapId(row.builder_id),
    broker_id: mapId(row.broker_id),
    project_id: mapId(row.project_id),
    interested_project_id: mapId(row.interested_project_id),
    buyer_lead_id: mapId(row.buyer_lead_id),
    lead_id: mapId(row.lead_id),
  }));
}

export async function seedSupabase(supabase) {
  const order = ["companies", "app_users", "builders", "brokers", "projects", "leads", "units", "lead_activities"];
  const summary = [];

  for (const table of order) {
    const rows = normalizeRows(table);
    if (!rows.length) {
      summary.push({ table, inserted: 0, skipped: true });
      continue;
    }

    const { data, error } = await supabase.from(table).upsert(rows, { onConflict: "id" }).select("id");
    if (error) {
      return {
        ok: false,
        table,
        error: error.message,
        summary,
      };
    }

    summary.push({ table, inserted: data?.length || rows.length });
  }

  return { ok: true, summary };
}
