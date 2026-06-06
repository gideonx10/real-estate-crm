import { AuthShell } from "@/components/AuthShell";
import "./globals.css";

export const metadata = {
  title: "Aakarsh Group CRM",
  description: "Mobile-first CRM for real estate teams",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192x192.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Aakarsh Group CRM",
    statusBarStyle: "default",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="antialiased">
      <body className="bg-surface text-zinc-950">
        <AuthShell>
          <main className="mx-auto min-h-dvh w-full max-w-6xl px-4 pb-28 pt-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </AuthShell>
      </body>
    </html>
  );
}
