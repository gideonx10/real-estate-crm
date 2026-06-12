import { getSupabaseServerClient, getSupabaseServiceClient } from "@/lib/supabase";

export const allowedTables = new Set([
  "companies",
  "builders",
  "brokers",
  "projects",
  "leads",
  "units",
  "lead_activities",
  "project_price_history",
  "project_brochures",
]);
const tablesWithUpdatedAt = new Set(["projects", "leads", "units"]);

export function getDatabaseClient() {
  return getSupabaseServiceClient() || getSupabaseServerClient();
}

export async function listRecords(table) {
  if (!allowedTables.has(table)) return Response.json({ error: "Unknown table" }, { status: 404 });

  const supabase = getDatabaseClient();
  if (!supabase) {
    return Response.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data, source: "supabase" });
}

export async function createRecord(table, request) {
  if (!allowedTables.has(table)) return Response.json({ error: "Unknown table" }, { status: 404 });

  const payload = await request.json();
  const supabase = getDatabaseClient();
  if (!supabase) {
    return Response.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const insertPayload = { ...payload };
  if (["builders", "brokers", "projects", "leads"].includes(table) && !insertPayload.company_id) {
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (companyError) return Response.json({ error: companyError.message }, { status: 500 });
    if (company?.id) insertPayload.company_id = company.id;
  }

  const existing = await findDuplicateRecord(supabase, table, insertPayload);
  if (existing.error) return Response.json({ error: existing.error.message }, { status: 500 });
  if (existing.data) return Response.json({ data: existing.data, source: "supabase-existing" });

  const { data, error } = await supabase.from(table).insert(insertPayload).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data, source: "supabase" }, { status: 201 });
}

async function findDuplicateRecord(supabase, table, payload) {
  let query = null;

  if (table === "projects" && payload.name && payload.location) {
    query = supabase
      .from(table)
      .select("*")
      .eq("company_id", payload.company_id)
      .eq("name", payload.name)
      .eq("location", payload.location);
  }

  if (table === "leads" && payload.phone) {
    query = supabase
      .from(table)
      .select("*")
      .eq("company_id", payload.company_id)
      .eq("phone", payload.phone);
  }

  if (table === "builders" && payload.phone) {
    query = supabase
      .from(table)
      .select("*")
      .eq("company_id", payload.company_id)
      .eq("phone", payload.phone);
  }

  if (table === "brokers" && payload.phone) {
    query = supabase
      .from(table)
      .select("*")
      .eq("company_id", payload.company_id)
      .eq("phone", payload.phone);
  }

  if (!query) return { data: null, error: null };
  return query.order("created_at", { ascending: false }).limit(1).maybeSingle();
}

export async function updateRecord(table, id, request) {
  if (!allowedTables.has(table)) return Response.json({ error: "Unknown table" }, { status: 404 });

  const payload = await request.json();
  const supabase = getDatabaseClient();
  if (!supabase) {
    return Response.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const updatePayload = { ...payload };
  if (tablesWithUpdatedAt.has(table)) {
    updatePayload.updated_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from(table)
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data, source: "supabase" });
}

export async function deleteRecord(table, id) {
  if (!allowedTables.has(table)) return Response.json({ error: "Unknown table" }, { status: 404 });

  const supabase = getDatabaseClient();
  if (!supabase) {
    return Response.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data: { id }, source: "supabase" });
}

export async function listAllRecords() {
  const supabase = getDatabaseClient();
  if (!supabase) {
    return Response.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const tableNames = ["companies", "builders", "brokers", "projects", "leads", "units", "lead_activities", "project_price_history", "project_brochures"];
  const entries = await Promise.all(
    tableNames.map(async (table) => {
      const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
      return [table, data || [], error];
    })
  );

  const failed = entries.find(([, , error]) => error);
  if (failed) {
    return Response.json({ error: failed[2].message, table: failed[0] }, { status: 500 });
  }

  return Response.json({ data: Object.fromEntries(entries.map(([table, data]) => [table, data])), source: "supabase" });
}
