"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: true,
      callbackUrl: "/dashboard",
    });
    if (result?.error) setError("Invalid CRM credentials");
  }

  return (
    <div className="mx-auto grid min-h-[75dvh] max-w-md place-items-center">
      <Card className="w-full">
        <h1 className="text-2xl font-bold text-navy">Real Estate CRM</h1>
        <p className="mt-1 text-sm font-semibold text-zinc-500">Sign in with the configured single-user account.</p>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <Input label="Email" name="email" type="email" required />
          <Input label="Password" name="password" type="password" required />
          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
      </Card>
    </div>
  );
}
