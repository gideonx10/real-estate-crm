"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, UserCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function ProfilePage() {
  const { update } = useSession();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      const response = await fetch("/api/me", { cache: "no-store" });
      const result = await response.json();
      if (!cancelled && response.ok) {
        setProfile(result.data);
        setName(result.data.name || "");
      }
    }
    loadProfile();
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
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-navy/10 text-navy">
          <UserCircle size={54} />
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
    </div>
  );
}
