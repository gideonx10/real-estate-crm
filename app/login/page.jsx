"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: true,
      callbackUrl: "/dashboard",
    });
    if (result?.error) {
      setError("Invalid CRM credentials");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[86dvh] w-full max-w-md place-items-center">
      <Card className="w-full rounded-[28px] p-6 shadow-lg shadow-zinc-200/60">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-100">
          <Image src="/aakarsh-group-logo.png" alt="Aakarsh Group logo" width={80} height={80} className="h-full w-full object-cover" priority />
        </div>
        <h1 className="text-center text-2xl font-bold text-navy">Aakarsh Group CRM</h1>
        <p className="mt-1 text-center text-sm font-semibold text-zinc-500">Sign in to manage projects, leads, and contacts.</p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-zinc-700">
            <span>Username</span>
            <div className="grid h-12 grid-cols-[44px_1fr] items-center rounded-xl border border-zinc-200 bg-white transition focus-within:border-navy focus-within:ring-4 focus-within:ring-navy/10">
              <UserRound className="mx-auto text-zinc-400" size={19} />
              <input
                name="email"
                required
                autoComplete="username"
                placeholder="Enter username"
                className="h-full min-w-0 rounded-r-xl bg-transparent pr-4 text-base text-zinc-950 outline-none"
              />
            </div>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-zinc-700">
            <span>Password</span>
            <div className="grid h-12 grid-cols-[44px_1fr_44px] items-center rounded-xl border border-zinc-200 bg-white transition focus-within:border-navy focus-within:ring-4 focus-within:ring-navy/10">
              <LockKeyhole className="mx-auto text-zinc-400" size={19} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter password"
                className="h-full min-w-0 bg-transparent text-base text-zinc-950 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="grid h-full place-items-center rounded-r-xl text-zinc-500"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </label>

          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
