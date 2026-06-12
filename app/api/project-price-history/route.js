import { createRecord, listRecords } from "@/lib/api-routes";

export function GET() {
  return listRecords("project_price_history");
}

export function POST(request) {
  return createRecord("project_price_history", request);
}
