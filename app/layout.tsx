import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/ui/app-shell";

export const metadata: Metadata = {
  title: "کنترل کیفیت قهوه",
  description: "مدیریت کنترل کیفیت قهوه",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
