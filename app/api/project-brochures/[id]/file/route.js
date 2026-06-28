import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabaseClient } from "@/lib/api-routes";

export const dynamic = "force-dynamic";

export async function GET(request, context) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = getDatabaseClient();
  if (!supabase) {
    return Response.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { data: brochure, error } = await supabase
    .from("project_brochures")
    .select("id,name,url,public_id")
    .eq("id", id)
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!brochure) return Response.json({ error: "Brochure not found" }, { status: 404 });

  const sourceUrl = brochure.url || cloudinaryRawUrl(brochure.public_id);
  if (!sourceUrl) return Response.json({ error: "Brochure URL is missing" }, { status: 404 });

  const upstreamHeaders = new Headers();
  const range = request.headers.get("range");
  if (range) upstreamHeaders.set("range", range);

  const upstream = await fetch(sourceUrl, {
    headers: upstreamHeaders,
    cache: "no-store",
  });

  if (!upstream.ok && upstream.status !== 206) {
    return Response.json({ error: "Unable to load brochure from Cloudinary" }, { status: upstream.status });
  }

  const fileName = safePdfName(brochure.name);
  const requestUrl = new URL(request.url);
  const disposition = requestUrl.searchParams.get("download") === "1" ? "attachment" : "inline";
  const headers = new Headers({
    "content-type": "application/pdf",
    "content-disposition": `${disposition}; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    "cache-control": "private, max-age=300",
    "accept-ranges": upstream.headers.get("accept-ranges") || "bytes",
  });

  copyHeader(upstream.headers, headers, "content-length");
  copyHeader(upstream.headers, headers, "content-range");
  copyHeader(upstream.headers, headers, "etag");
  copyHeader(upstream.headers, headers, "last-modified");

  return new Response(upstream.body, {
    status: upstream.status === 206 ? 206 : 200,
    headers,
  });
}

function copyHeader(from, to, name) {
  const value = from.get(name);
  if (value) to.set(name, value);
}

function safePdfName(name = "brochure.pdf") {
  const cleaned = String(name)
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  const fallback = cleaned || "brochure.pdf";
  return fallback.toLowerCase().endsWith(".pdf") ? fallback : `${fallback}.pdf`;
}

function cloudinaryRawUrl(publicId) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !publicId) return "";
  const encodedPublicId = String(publicId)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `https://res.cloudinary.com/${cloudName}/raw/upload/${encodedPublicId}`;
}
