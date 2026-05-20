import { getDatabaseClient } from "@/lib/api-routes";
import { seedSupabase } from "@/lib/supabase-seed";

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("confirm") !== "seed") {
    return Response.json({ error: "Call POST /api/seed?confirm=seed to seed the database." }, { status: 400 });
  }

  const supabase = getDatabaseClient();
  if (!supabase) {
    return Response.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const result = await seedSupabase(supabase);
  return Response.json(result, { status: result.ok ? 200 : 500 });
}
