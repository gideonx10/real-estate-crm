import { createRecord, listRecords } from "@/lib/api-routes";

export function GET() {
  return listRecords("units");
}

export function POST(request) {
  return createRecord("units", request);
}
