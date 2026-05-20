import { deleteRecord } from "@/lib/api-routes";

export async function DELETE(_request, context) {
  const { table, id } = await context.params;
  return deleteRecord(table, id);
}
