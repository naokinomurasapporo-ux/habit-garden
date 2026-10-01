import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/BottomNav";
import { LegendUnlockToast } from "@/components/LegendUnlockToast";
import { NavTracker } from "@/components/NavTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habit Garden",
  description: "習慣を続けて、植物を育てよう",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f5f0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full font-sans">
        <div className="mx-auto min-h-dvh max-w-md pb-[calc(var(--nav-total)+1.5rem)]">{children}</div>
        <NavTracker />
        <BottomNav />
        <LegendUnlockToast />
      </body>
    </html>
  );
}
