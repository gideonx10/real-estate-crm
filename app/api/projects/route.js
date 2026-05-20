import { createRecord, listRecords } from "@/lib/api-routes";

export function GET() {
  return listRecords("projects");
}

export function POST(request) {
  return createRecord("projects", request);
}
