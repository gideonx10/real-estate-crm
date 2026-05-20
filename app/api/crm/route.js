import { listAllRecords } from "@/lib/api-routes";

export function GET() {
  return listAllRecords();
}
