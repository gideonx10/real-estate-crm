import { getSupabaseServerClient, getSupabaseServiceClient } from "@/lib/supabase";
import { deleteProjectBrochure as deleteCloudinaryProjectBrochure } from "@/src/lib/uploads/deleteAsset";

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
  if (error?.code === "23505") {
    const duplicate = await findDuplicateRecord(supabase, table, insertPayload);
    if (duplicate.data) {
      return Response.json({ data: duplicate.data, source: "supabase-existing" });
    }
  }
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

  if (table === "projects") {
    const cleanup = await deleteProjectAssets(supabase, id);
    if (cleanup.error) {
      return Response.json({ error: cleanup.error.message }, { status: 502 });
    }
  }

  const { data, error } = await supabase.from(table).delete().eq("id", id).select("id").maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: "Record not found" }, { status: 404 });
  return Response.json({ data: { id }, source: "supabase" });
}

async function deleteProjectAssets(supabase, projectId) {
  const [projectResult, brochuresResult] = await Promise.all([
    supabase.from("projects").select("brochure_public_id").eq("id", projectId).maybeSingle(),
    supabase.from("project_brochures").select("public_id").eq("project_id", projectId),
  ]);

  if (projectResult.error) return { error: projectResult.error };
  if (brochuresResult.error) return { error: brochuresResult.error };

  const publicIds = new Set([
    projectResult.data?.brochure_public_id,
    ...(brochuresResult.data || []).map((brochure) => brochure.public_id),
  ]);

  try {
    for (const publicId of publicIds) {
      if (publicId) await deleteCloudinaryProjectBrochure(publicId);
    }
    return { error: null };
  } catch (error) {
    return { error };
  }
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
