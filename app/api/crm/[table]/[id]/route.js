import { deleteRecord, updateRecord } from "@/lib/api-routes";

export async function PATCH(request, context) {
  const { table, id } = await context.params;
  return updateRecord(table, id, request);
}

export async function DELETE(_request, context) {
  const { table, id } = await context.params;
  return deleteRecord(table, id);
}
