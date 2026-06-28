import { CLOUDINARY_FOLDERS } from "@/src/constants/cloudinary";
import { assertAllowedPdf, assertRequiredId } from "@/src/lib/uploads/validation";
import { uploadToCloudinary } from "@/src/lib/uploads/uploadToCloudinary";

export async function uploadProjectBrochureFile(file, projectId) {
  const id = assertRequiredId(projectId, "Project id");
  assertAllowedPdf(file);

  const uniqueId = `${id}-${Date.now()}.pdf`;
  const result = await uploadToCloudinary(file, {
    folder: CLOUDINARY_FOLDERS.PROJECT_BROCHURES,
    public_id: uniqueId,
    resource_type: "raw",
    filename_override: file.name || "brochure.pdf",
    use_filename: false,
  });

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
  };
}
