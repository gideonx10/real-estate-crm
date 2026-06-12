import { createRecord, listRecords } from "@/lib/api-routes";

export function GET() {
  return listRecords("project_brochures");
}

export function POST(request) {
  return createRecord("project_brochures", request);
}
