import { createRecord, listRecords } from "@/lib/api-routes";

export function GET() {
  return listRecords("lead_activities");
}

export function POST(request) {
  return createRecord("lead_activities", request);
}
