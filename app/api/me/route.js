import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabaseClient } from "@/lib/api-routes";

async function fetchProfileDirect(supabase, userId) {
  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return { data, error };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getDatabaseClient();

  // Try RPC first, fall back to direct query if it fails
  let profile = null;
  try {
    const { data, error } = await supabase.rpc("get_app_user_profile", {
      input_user_id: session.user.id,
    });
    if (!error) {
      profile = Array.isArray(data) ? data[0] : data;
    }
  } catch {
    // RPC failed, will fall back below
  }

  if (!profile) {
    const { data, error } = await fetchProfileDirect(supabase, session.user.id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    profile = data;
  }

  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  return Response.json({ data: profile });
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const supabase = getDatabaseClient();

  // Try RPC first, fall back to direct update
  let profile = null;
  try {
    const { data, error } = await supabase.rpc("update_app_user_profile", {
      input_user_id: session.user.id,
      input_name: payload.name,
    });
    if (!error) {
      profile = Array.isArray(data) ? data[0] : data;
    }
  } catch {
    // RPC failed, will fall back below
  }

  if (!profile) {
    const { data, error } = await supabase
      .from("app_users")
      .update({ name: payload.name, updated_at: new Date().toISOString() })
      .eq("id", session.user.id)
      .select("*")
      .maybeSingle();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    profile = data;
  }

  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  return Response.json({ data: profile });
}
