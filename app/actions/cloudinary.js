"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabaseClient } from "@/lib/api-routes";
import { uploadUserAvatarFile } from "@/src/lib/uploads/uploadUserAvatar";
import { uploadLeadAvatarFile } from "@/src/lib/uploads/uploadLeadAvatar";
import { uploadProjectBrochureFile } from "@/src/lib/uploads/uploadProjectBrochure";
import {
  deleteLeadAvatar as deleteCloudinaryLeadAvatar,
  deleteProjectBrochure as deleteCloudinaryProjectBrochure,
  deleteUserAvatar as deleteCloudinaryUserAvatar,
} from "@/src/lib/uploads/deleteAsset";
import { assertAakarshPublicId, assertRequiredId } from "@/src/lib/uploads/validation";

function ok(data) {
  return { ok: true, data };
}

function fail(error) {
  console.error(error);
  return { ok: false, error: error.message || "Upload failed" };
}

async function requireSessionUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

async function updateRecord(table, id, payload) {
  const supabase = getDatabaseClient();
  if (!supabase) throw new Error("Supabase is not configured");

  const { data, error } = await supabase
    .from(table)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error(`Record not found in ${table}`);
  return data;
}

export async function uploadUserAvatar(formData) {
  try {
    const userId = await requireSessionUserId();
    const file = formData.get("file");
    const upload = await uploadUserAvatarFile(file, userId);
    const data = await updateRecord("app_users", userId, {
      avatar_url: upload.secureUrl,
      avatar_public_id: upload.publicId,
    });
    return ok({ secureUrl: upload.secureUrl, publicId: upload.publicId, record: data });
  } catch (error) {
    return fail(error);
  }
}

export async function uploadLeadAvatar(formData) {
  try {
    await requireSessionUserId();
    const leadId = assertRequiredId(formData.get("leadId"), "Lead id");
    const file = formData.get("file");
    const upload = await uploadLeadAvatarFile(file, leadId);
    const data = await updateRecord("leads", leadId, {
      avatar_url: upload.secureUrl,
      avatar_public_id: upload.publicId,
      photo_url: upload.secureUrl,
    });
    return ok({ secureUrl: upload.secureUrl, publicId: upload.publicId, record: data });
  } catch (error) {
    return fail(error);
  }
}

export async function uploadProjectBrochure(formData) {
  try {
    await requireSessionUserId();
    const projectId = assertRequiredId(formData.get("projectId"), "Project id");
    const file = formData.get("file");
    const upload = await uploadProjectBrochureFile(file, projectId);

    // Insert into project_brochures table (multi-brochure support)
    const supabase = getDatabaseClient();
    if (!supabase) throw new Error("Supabase is not configured");

    const { data, error } = await supabase
      .from("project_brochures")
      .insert({
        project_id: projectId,
        name: file.name || "brochure.pdf",
        url: upload.secureUrl,
        public_id: upload.publicId,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return ok({ secureUrl: upload.secureUrl, publicId: upload.publicId, record: data });
  } catch (error) {
    return fail(error);
  }
}

export async function deleteUserAvatar(formData) {
  try {
    const userId = await requireSessionUserId();
    const publicId = assertAakarshPublicId(formData.get("publicId"));
    await deleteCloudinaryUserAvatar(publicId);
    const data = await updateRecord("app_users", userId, { avatar_url: null, avatar_public_id: null });
    return ok({ publicId, record: data });
  } catch (error) {
    return fail(error);
  }
}

export async function deleteLeadAvatar(formData) {
  try {
    await requireSessionUserId();
    const leadId = assertRequiredId(formData.get("leadId"), "Lead id");
    const publicId = assertAakarshPublicId(formData.get("publicId"));
    await deleteCloudinaryLeadAvatar(publicId);
    const data = await updateRecord("leads", leadId, { avatar_url: null, avatar_public_id: null, photo_url: null });
    return ok({ publicId, record: data });
  } catch (error) {
    return fail(error);
  }
}

export async function deleteProjectBrochure(formData) {
  try {
    await requireSessionUserId();
    const brochureId = assertRequiredId(formData.get("brochureId"), "Brochure id");
    const publicId = assertAakarshPublicId(formData.get("publicId"));
    await deleteCloudinaryProjectBrochure(publicId);

    // Delete from project_brochures table
    const supabase = getDatabaseClient();
    if (!supabase) throw new Error("Supabase is not configured");

    const { error } = await supabase
      .from("project_brochures")
      .delete()
      .eq("id", brochureId);

    if (error) throw new Error(error.message);
    return ok({ publicId, brochureId });
  } catch (error) {
    return fail(error);
  }
}
