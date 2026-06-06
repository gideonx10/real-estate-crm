import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabaseClient } from "@/lib/api-routes";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getDatabaseClient();
  const { data, error } = await supabase.rpc("get_app_user_profile", {
    input_user_id: session.user.id,
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data: Array.isArray(data) ? data[0] : data });
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const supabase = getDatabaseClient();
  const { data, error } = await supabase.rpc("update_app_user_profile", {
    input_user_id: session.user.id,
    input_name: payload.name,
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data: Array.isArray(data) ? data[0] : data });
}
