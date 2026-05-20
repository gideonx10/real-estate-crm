import { createRecord, listRecords } from "@/lib/api-routes";

export function GET() {
  return listRecords("leads");
}

export function POST(request) {
  return createRecord("leads", request);
}
