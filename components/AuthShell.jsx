"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BottomNav } from "@/components/ui/BottomNav";

const publicRoutes = new Set(["/login"]);

export function AuthShell({ children }) {
  return (
    <SessionProvider>
      <AuthGate>{children}</AuthGate>
    </SessionProvider>
  );
}

function AuthGate({ children }) {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicRoute = publicRoutes.has(pathname);

  useEffect(() => {
    if (status === "unauthenticated" && !isPublicRoute) {
      router.replace("/login");
    }

    if (status === "authenticated" && pathname === "/login") {
      router.replace("/dashboard");
    }
  }, [isPublicRoute, pathname, router, status]);

  if (status === "loading") {
    return <div className="mx-auto h-96 w-full max-w-md animate-pulse rounded-3xl bg-white" />;
  }

  if (status === "unauthenticated" && !isPublicRoute) {
    return null;
  }

  if (isPublicRoute) {
    return children;
  }

  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
