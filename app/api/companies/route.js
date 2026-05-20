import { createRecord, listRecords } from "@/lib/api-routes";

export function GET() {
  return listRecords("companies");
}

export function POST(request) {
  return createRecord("companies", request);
}
