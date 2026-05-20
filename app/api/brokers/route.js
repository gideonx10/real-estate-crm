import { createRecord, listRecords } from "@/lib/api-routes";

export function GET() {
  return listRecords("brokers");
}

export function POST(request) {
  return createRecord("brokers", request);
}
