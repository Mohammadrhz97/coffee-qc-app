"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

type AppShellProps = {
  children: ReactNode;
};

const navItems = [
  {
    label: "داشبورد",
    href: "/dashboard",
    icon: "/dashboard.png",
  },
  {
    label: "کافه‌ها",
    href: "/cafes",
    icon: "/cafe-v2.png",
  },
  {
    label: "گزارش‌ها",
    href: "/reports",
    icon: "/reports.png",
  },
];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden text-white"
    >
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(5, 5, 5, 0.42), rgba(5, 5, 5, 0.42)), url("/qc-background.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="pointer-events-none fixed inset-0 z-0 bg-black/10" />

      {/* =================================================
          DESKTOP HEADER
      ================================================= */}

      <header className="relative z-30 hidden border-b border-white/[0.06] bg-black/25 backdrop-blur-2xl md:block">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
          {/* RIGHT - MENU + TITLE */}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="باز کردن منو"
              className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.06] text-white/60 shadow-lg transition hover:bg-white/[0.1] hover:text-white"
            >
              <span className="text-2xl leading-none mt-1">☰</span>
            </button>

            <Link href="/dashboard" className="flex flex-col">
              <h1 className="text-sm font-semibold tracking-tight">
                سیستم ثبت گزارشات کنترل کیفی
              </h1>

              <p className="mt-0.5 text-[10px] tracking-[0.12em] text-white/30">
                رستری قهوه امکان
              </p>
            </Link>
          </div>

          {/* LEFT - LOGO */}

          <Link href="/dashboard">
            <Image
              src="/logo-white.png"
              alt="لوگوی امکان"
              width={120}
              height={120}
              className="h-24 w-24 object-contain"
            />
          </Link>
        </div>
      </header>

      {/* =================================================
          DESKTOP DRAWER OVERLAY
      ================================================= */}

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 hidden bg-black/50 backdrop-blur-[2px] md:block"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* =================================================
          DESKTOP DRAWER
      ================================================= */}

      <aside
        className={`fixed right-0 top-0 z-50 hidden h-screen w-[320px] border-l border-white/[0.08] bg-[#0c0c0c]/95 shadow-2xl backdrop-blur-3xl transition-transform duration-300 md:block ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Drawer Header */}

          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5">
            <div>
              <p className="text-sm font-semibold text-white/90">کنترل کیفیت</p>

              <p className="mt-1 text-[10px] text-white/30">رستری قهوه امکان</p>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="بستن منو"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-lg text-white/40 transition hover:bg-white/[0.08] hover:text-white"
            >
              ×
            </button>
          </div>

          {/* Navigation */}

          <div className="flex-1 px-4 py-6">
            <p className="mb-3 px-3 text-[10px] font-medium tracking-[0.12em] text-white/25">
              دسترسی سریع
            </p>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                console.log("icon:", item.icon);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition ${
                      isActive
                        ? "border-[#E17729]/25 bg-[#E17729]/10 text-[#E17729]"
                        : "border-white/[0.06] bg-white/[0.03] text-white/45 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white/80"
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
                      <Image
                        src={item.icon}
                        alt=""
                        width={40}
                        height={40}
                        className="h-8 w-8 object-contain"
                      />
                    </span>

                    <span className="text-sm font-medium">{item.label}</span>

                    {isActive && (
                      <span className="mr-auto h-2 w-2 rounded-full bg-[#E17729] shadow-[0_0_10px_rgba(225,119,41,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* New QC */}

            <div className="mt-6 border-t border-white/[0.06] pt-6">
              <p className="mb-3 px-3 text-[10px] font-medium tracking-[0.12em] text-white/25">
                عملیات
              </p>

              <Link
                href="/qc/new"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#E17729] px-4 py-4 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(225,119,41,0.2)] transition hover:bg-[#F08A3D]"
              >
                <span className="text-lg">+</span>
                ثبت گزارش کنترل کیفی جدید
              </Link>
            </div>
          </div>

          {/* Drawer Footer */}

          <div className="border-t border-white/[0.06] px-5 py-5">
            <p className="text-center text-[10px] text-white/20">
              امکان فردای روشن | 2026
            </p>
          </div>
        </div>
      </aside>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="relative z-10 mx-auto min-h-screen max-w-7xl px-4 pb-28 pt-6 md:min-h-[calc(100vh-72px)] md:px-6 md:pb-10 md:pt-10">
        {children}
      </main>

      {/* =================================================
          MOBILE BOTTOM NAV
      ================================================= */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.07] bg-black/70 backdrop-blur-2xl md:hidden">
        <div className="mx-auto grid h-[72px] max-w-md grid-cols-3 px-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center gap-1"
              >
                {isActive && (
                  <div className="absolute top-0 h-[2px] w-8 rounded-full bg-[#E17729] shadow-[0_0_14px_rgba(225,119,41,0.8)]" />
                )}

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                    isActive ? "bg-[#E17729]/15" : "bg-transparent"
                  }`}
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={36}
                    height={36}
                    className={`h-8 w-8 object-contain transition ${
                      isActive ? "opacity-100" : "opacity-45"
                    }`}
                  />
                </div>

                <span
                  className={`text-[10px] ${
                    isActive ? "font-semibold text-white/80" : "text-white/30"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
