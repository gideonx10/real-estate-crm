import { CLOUDINARY_FOLDERS } from "@/src/constants/cloudinary";
import { assertAllowedImage, assertRequiredId } from "@/src/lib/uploads/validation";
import { uploadToCloudinary } from "@/src/lib/uploads/uploadToCloudinary";

export async function uploadLeadAvatarFile(file, leadId) {
  const id = assertRequiredId(leadId, "Lead id");
  assertAllowedImage(file);

  const result = await uploadToCloudinary(file, {
    folder: CLOUDINARY_FOLDERS.LEAD_AVATARS,
    public_id: id,
    overwrite: true,
    resource_type: "image",
  });

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
  };
}
