import { BottomNav } from "@/components/ui/BottomNav";
import "./globals.css";

export const metadata = {
  title: "Real Estate CRM",
  description: "Mobile-first CRM for real estate teams",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-surface text-zinc-950">
        <main className="mx-auto min-h-dvh w-full max-w-6xl px-4 pb-28 pt-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
