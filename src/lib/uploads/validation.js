const imageExtensions = new Set(["jpg", "jpeg", "png", "webp"]);

export function getFileExtension(fileName = "") {
  return String(fileName).split(".").pop()?.toLowerCase() || "";
}

export function assertRequiredId(value, label) {
  const id = String(value || "").trim();
  if (!id) throw new Error(`${label} is required`);
  return id;
}

export function assertAllowedImage(file) {
  if (!file || file.size <= 0) throw new Error("Image file is required");
  const extension = getFileExtension(file.name);
  if (!imageExtensions.has(extension)) {
    throw new Error("Only jpg, jpeg, png, or webp images are allowed");
  }
  return extension;
}

export function assertAllowedPdf(file) {
  if (!file || file.size <= 0) throw new Error("PDF file is required");
  const extension = getFileExtension(file.name);
  if (extension !== "pdf") throw new Error("Only pdf brochures are allowed");
  return extension;
}

export function assertAakarshPublicId(publicId) {
  if (!String(publicId || "").startsWith("Aakarsh CRM/")) {
    throw new Error("Unauthorized Cloudinary path");
  }
  return publicId;
}
