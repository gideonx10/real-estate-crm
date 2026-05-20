import { createRecord, listRecords } from "@/lib/api-routes";

export function GET() {
  return listRecords("builders");
}

export function POST(request) {
  return createRecord("builders", request);
}
