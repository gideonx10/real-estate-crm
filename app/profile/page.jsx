"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Trash2, UploadCloud, UserCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { deleteUserAvatar, uploadUserAvatar } from "@/app/actions/cloudinary";

export default function ProfilePage() {
  const { update } = useSession();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [confirmDeleteAvatar, setConfirmDeleteAvatar] = useState(false);

  async function loadProfile() {
    const response = await fetch("/api/me", { cache: "no-store" });
    const result = await response.json();
    if (response.ok && result.data) {
      setProfile(result.data);
      setName(result.data.name || "");
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const response = await fetch("/api/me", { cache: "no-store" });
      const result = await response.json();
      if (!cancelled && response.ok) {
        setProfile(result.data);
        setName(result.data.name || "");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update profile");
      setProfile(result.data);
      await update({ name: result.data.name });
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadUserAvatar(formData);
      if (!result.ok) throw new Error(result.error || "Unable to upload avatar");
      // Re-fetch profile to get fresh data from database
      await loadProfile();
      setMessage("Profile photo updated.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  }

  async function handleAvatarDelete() {
    if (!profile?.avatar_public_id) return;
    setUploadingAvatar(true);
    setMessage("");
    setConfirmDeleteAvatar(false);
    try {
      const formData = new FormData();
      formData.set("publicId", profile.avatar_public_id);
      const result = await deleteUserAvatar(formData);
      if (!result.ok) throw new Error(result.error || "Unable to delete avatar");
      // Re-fetch profile to get fresh data from database
      await loadProfile();
      setMessage("Profile photo removed.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <div className="grid gap-5">
      <header className="flex items-center gap-3">
        <Button href="/dashboard" variant="secondary" size="icon" aria-label="Back to dashboard">
          <ArrowLeft size={19} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-navy">Profile</h1>
          <p className="text-sm font-semibold text-zinc-500">Database connected user profile</p>
        </div>
      </header>

      <Card className="grid gap-5 p-6">
        <div className="mx-auto grid justify-items-center gap-3">
          <div className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-navy/10 text-navy">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="Profile photo" fill sizes="96px" unoptimized className="object-cover" />
            ) : (
              <UserCircle size={54} />
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-3 text-sm font-semibold text-navy ring-1 ring-zinc-200 hover:bg-zinc-50">
              <UploadCloud size={16} /> {uploadingAvatar ? "Uploading..." : "Upload Photo"}
              <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} disabled={uploadingAvatar} />
            </label>
            {profile?.avatar_public_id ? (
              <Button type="button" size="sm" variant="danger" onClick={() => setConfirmDeleteAvatar(true)} disabled={uploadingAvatar}>
                <Trash2 size={16} /> Remove
              </Button>
            ) : null}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
          <Input label="Username" value={profile?.username || ""} readOnly />
          <Input label="Role" value={profile?.role || "admin"} readOnly />
          {message ? <p className="text-sm font-semibold text-zinc-600">{message}</p> : null}
          <Button type="submit" disabled={saving} className="w-full" size="lg">
            <Check size={18} /> {saving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </Card>

      <ConfirmDialog
        open={confirmDeleteAvatar}
        message={`Are you sure you want to delete your profile photo?`}
        onConfirm={handleAvatarDelete}
        onCancel={() => setConfirmDeleteAvatar(false)}
      />
    </div>
  );
}

