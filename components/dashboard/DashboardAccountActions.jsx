"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DashboardAccountActions() {
  const { data: session } = useSession();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        href="/profile"
        className="grid h-10 w-10 place-items-center rounded-full bg-white text-navy shadow-sm ring-1 ring-zinc-200"
        aria-label={`Profile: ${session?.user?.name || "User"}`}
      >
        <UserCircle size={21} />
      </Link>
      <Button
        type="button"
        size="icon"
        variant="secondary"
        aria-label="Logout"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut size={18} />
      </Button>
    </div>
  );
}
