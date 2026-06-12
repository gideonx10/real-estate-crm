import { getCloudinary } from "@/src/lib/cloudinary";
import { assertAakarshPublicId } from "@/src/lib/uploads/validation";

async function deleteCloudinaryAsset(publicId, resourceType = "image") {
  const safePublicId = assertAakarshPublicId(publicId);
  const result = await getCloudinary().uploader.destroy(safePublicId, {
    resource_type: resourceType,
  });

  return result;
}

export function deleteUserAvatar(publicId) {
  return deleteCloudinaryAsset(publicId, "image");
}

export function deleteLeadAvatar(publicId) {
  return deleteCloudinaryAsset(publicId, "image");
}

export function deleteProjectBrochure(publicId) {
  return deleteCloudinaryAsset(publicId, "raw");
}
