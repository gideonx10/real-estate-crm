"use client";

import { useState } from "react";
import { uploadLeadAvatar, uploadProjectBrochure } from "@/app/actions/cloudinary";

export function ExampleLeadAvatarUpload({ leadId }) {
  const [message, setMessage] = useState("");

  async function handleChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("leadId", leadId);
    formData.set("file", file);
    const result = await uploadLeadAvatar(formData);
    setMessage(result.ok ? "Avatar uploaded" : result.error);
  }

  return (
    <label>
      <span>Lead avatar</span>
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChange} />
      {message ? <p>{message}</p> : null}
    </label>
  );
}

export function ExampleProjectBrochureUpload({ projectId }) {
  async function handleChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("projectId", projectId);
    formData.set("file", file);
    await uploadProjectBrochure(formData);
  }

  return <input type="file" accept="application/pdf" onChange={handleChange} />;
}
