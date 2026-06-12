import { CLOUDINARY_FOLDERS } from "@/src/constants/cloudinary";
import { assertAllowedPdf, assertRequiredId } from "@/src/lib/uploads/validation";
import { uploadToCloudinary } from "@/src/lib/uploads/uploadToCloudinary";

export async function uploadProjectBrochureFile(file, projectId) {
  const id = assertRequiredId(projectId, "Project id");
  assertAllowedPdf(file);

  const uniqueId = `${id}-${Date.now()}`;
  const result = await uploadToCloudinary(file, {
    folder: CLOUDINARY_FOLDERS.PROJECT_BROCHURES,
    public_id: uniqueId,
    resource_type: "raw",
  });

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
  };
}

