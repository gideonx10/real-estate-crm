import { CLOUDINARY_FOLDERS } from "@/src/constants/cloudinary";
import { assertAllowedImage, assertRequiredId } from "@/src/lib/uploads/validation";
import { uploadToCloudinary } from "@/src/lib/uploads/uploadToCloudinary";

export async function uploadUserAvatarFile(file, supabaseUserId) {
  const userId = assertRequiredId(supabaseUserId, "Supabase user id");
  assertAllowedImage(file);

  const result = await uploadToCloudinary(file, {
    folder: CLOUDINARY_FOLDERS.USER_AVATARS,
    public_id: userId,
    overwrite: true,
    resource_type: "image",
  });

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
  };
}
