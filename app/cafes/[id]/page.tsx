"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

import type { Cafe } from "@/lib/types";
import AddCafeForm from "@/components/qc/add-cafe-form";

type CafeWithHistory = Cafe & {
  qcVisits?: {
    id: string;
    createdAt: string;
    coffeeLine?: {
      id: string;
      name: string;
    } | null;
    finalStatus?: string | null;
  }[];
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export default function CafePage() {
  const params = useParams();

  const slug = decodeURIComponent(params.id as string);

  const [cafe, setCafe] = useState<CafeWithHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  // -------------------------------------------------
  // LOAD CAFE
  // -------------------------------------------------

  async function loadCafe() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/cafes/${encodeURIComponent(slug)}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("کافه پیدا نشد");
        }

        throw new Error("Failed to fetch cafe");
      }

      const data: CafeWithHistory = await response.json();

      setCafe(data);
    } catch (error) {
      console.error("Load cafe error:", error);

      if (error instanceof Error && error.message === "کافه پیدا نشد") {
        setError("کافه پیدا نشد");
      } else {
        setError("خطا در دریافت اطلاعات کافه");
      }
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------------------------
  // INITIAL LOAD
  // -------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function fetchCafe() {
      try {
        const response = await fetch(`/api/cafes/${encodeURIComponent(slug)}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("کافه پیدا نشد");
          }

          throw new Error("Failed to fetch cafe");
        }

        const data: CafeWithHistory = await response.json();

        if (cancelled) return;

        setCafe(data);
        setError("");
        setLoading(false);
      } catch (error) {
        if (cancelled) return;

        console.error("Initial load cafe error:", error);

        if (error instanceof Error && error.message === "کافه پیدا نشد") {
          setError("کافه پیدا نشد");
        } else {
          setError("خطا در دریافت اطلاعات کافه");
        }

        setLoading(false);
      }
    }

    fetchCafe();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // -------------------------------------------------
  // LOADING
  // -------------------------------------------------

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4">
        <div className="glass relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/[0.08] px-8 py-10 text-center shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          {/* Glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#E17729]/10 blur-3xl" />

          {/* Spinner */}
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#E17729]/10" />

            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#E17729] border-r-[#E17729]/30" />

            <div className="h-2.5 w-2.5 rounded-full bg-[#E17729] shadow-[0_0_18px_rgba(225,119,41,0.8)]" />
          </div>

          {/* Text */}
          <div className="relative mt-6">
            <h3 className="text-sm font-semibold text-white/80">
              در حال آماده‌سازی پروفایل کافه
            </h3>

            <p className="mt-2 text-xs leading-6 text-white/35">
              اطلاعات کافه در حال دریافت است...
            </p>
          </div>

          {/* Loading dots */}
          <div className="relative mt-5 flex justify-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E17729]/70" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E17729]/50 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E17729]/30 [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------
  // ERROR
  // -------------------------------------------------

  if (error || !cafe) {
    return (
      <div className="space-y-6">
        <Link
          href="/cafes"
          className="inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white/80"
        >
          <span className="text-lg">←</span>
          بازگشت به کافه‌ها
        </Link>

        <div className="glass rounded-[28px] p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-2xl">
            ☕
          </div>

          <p className="mt-4 text-lg font-semibold">
            {error || "کافه پیدا نشد"}
          </p>

          <p className="mt-2 text-sm text-white/40">
            اطلاعات این کافه قابل دریافت نیست.
          </p>

          <button
            type="button"
            onClick={loadCafe}
            className="mt-6 rounded-xl bg-[#E17729] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E17729]/90"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------
  // EDIT
  // -------------------------------------------------

  if (isEditing) {
    return (
      <AddCafeForm
        cafe={cafe}
        onCancel={() => setIsEditing(false)}
        onSaved={async () => {
          setIsEditing(false);
          await loadCafe();
        }}
      />
    );
  }

  const equipment = cafe.equipment;

  const qcVisits = cafe.qcVisits ?? [];

  // -------------------------------------------------
  // PAGE
  // -------------------------------------------------

  return (
    <div className="mx-auto max-w-5xl space-y-5 md:space-y-6">
      {/* -------------------------------------------------
          Back
      ------------------------------------------------- */}

      <Link
        href="/cafes"
        className="inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white/80"
      >
        <span className="text-lg">←</span>
        بازگشت به کافه‌ها
      </Link>

      {/* -------------------------------------------------
          Cafe Header
      ------------------------------------------------- */}

      <section className="glass relative overflow-hidden rounded-[28px] p-5 md:p-7">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#E17729]/10 blur-[90px]" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-xl sm:flex">
              <Image
                src="/cafe-v2.png"
                alt=""
                width={48}
                height={48}
                className="h-16 w-16 object-contain"
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/35">
                پروفایل کافه
              </p>

              <h1 className="mt-1 truncate text-2xl font-bold tracking-tight md:text-3xl">
                {cafe.name}
              </h1>

              <p className="mt-1 text-sm text-white/40">
                {cafe.manager || "-"}
                <span className="mx-2 text-white/20">·</span>
                {cafe.region || "-"}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.08] px-3 py-1.5 text-[11px] font-medium text-emerald-300/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                  فعال
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="shrink-0 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-white/60 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            ✏️ ویرایش
          </button>
        </div>
      </section>

      {/* -------------------------------------------------
          New QC Visit
      ------------------------------------------------- */}

      <Link
        href={`/qc/new?cafeId=${cafe.id}`}
        className="group relative block overflow-hidden rounded-[28px] border border-[#E17729]/40 bg-gradient-to-br from-[#E17729] via-[#C85F1D] to-[#9F4716] p-5 shadow-[0_15px_50px_rgba(225,119,41,0.18)] transition hover:scale-[1.005] hover:shadow-[0_20px_60px_rgba(225,119,41,0.25)] md:p-6"
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/10 blur-[70px]" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl shadow-inner">
              +
            </div>

            <div>
              <h2 className="text-base font-bold md:text-lg">
                بازدید جدید کنترل کیفیت
              </h2>

              <p className="mt-1 text-xs text-white/65 md:text-sm">
                شروع یک گزارش جدید کنترل کیفیت
              </p>
            </div>
          </div>

          <span className="text-3xl font-light text-white/70 transition group-hover:translate-x-1">
            →
          </span>
        </div>
      </Link>

      {/* -------------------------------------------------
          Cafe Information
      ------------------------------------------------- */}

      <section className="glass rounded-[28px] p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.06] text-lg">
            <Image
              src="/information.png"
              alt=""
              width={48}
              height={48}
              className="h-10 w-10 object-contain"
            />
          </div>

          <div className="mt-2">
            <h2 className="text-base font-semibold">اطلاعات کافه</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {/* Manager */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.035] p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">
              مدیر
            </p>

            <p className="mt-2 text-sm font-medium text-white/85">
              {cafe.manager || "-"}
            </p>
          </div>

          {/* Phone */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.035] p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">
              تلفن
            </p>

            {cafe.phone ? (
              <a
                href={`tel:${cafe.phone}`}
                className="mt-2 block text-sm font-medium text-white/85 transition hover:text-[#E17729]"
              >
                {cafe.phone}
              </a>
            ) : (
              <p className="mt-2 text-sm font-medium text-white/40">-</p>
            )}
          </div>

          {/* Region */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.035] p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">
              منطقه
            </p>

            <p className="mt-2 text-sm font-medium text-white/85">
              {cafe.region || "-"}
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------
          Coffee Lines
      ------------------------------------------------- */}

      <section className="glass rounded-[28px] p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E17729]/15 bg-[#E17729]/10 text-lg">
              <Image
                src="/coffee.png"
                alt=""
                width={48}
                height={48}
                className="h-10 w-10 object-contain"
              />
            </div>

            <div>
              <h2 className="text-base font-semibold">لاین‌های قهوه</h2>

              <p className="mt-1 text-xs text-white/35">
                قهوه‌های مورد استفاده فعلی این کافه
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {cafe.coffeeLines.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 text-center">
              <p className="text-sm text-white/40">
                هنوز لاین قهوه‌ای ثبت نشده است.
              </p>
            </div>
          ) : (
            cafe.coffeeLines.map((line) => (
              <div
                key={line.id}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3 transition hover:border-white/[0.13] hover:bg-white/[0.055]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="mr-2 min-w-0">
                    <p className="truncate text-sm font-medium text-white/90">
                      {line.name}
                    </p>

                    <p className="mt-1 text-[11px] text-white/30">لاین قهوه</p>
                  </div>
                </div>

                <Link
                  href={`/qc/new?cafeId=${cafe.id}&lineId=${line.id}`}
                  className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-medium text-white/70 transition hover:border-[#E17729]/40 hover:bg-[#E17729]/10 hover:text-[#E17729]"
                >
                  کنترل کیفیت
                  <span className="text-base">→</span>
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      {/* -------------------------------------------------
          Equipment
      ------------------------------------------------- */}

      <section className="glass rounded-[28px] p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.06] text-lg">
            <Image
              src="/equipments.png"
              alt=""
              width={48}
              height={48}
              className="h-10 w-10 object-contain"
            />
          </div>

          <div>
            <h2 className="text-base font-semibold">تجهیزات</h2>

            <p className="mt-1 text-xs text-white/35">
              تجهیزات نصب‌شده در این کافه
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {/* Espresso Machine */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">
              دستگاه اسپرسو
            </p>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white/85">
                  {equipment?.espressoMachineBrand || "-"}
                </p>

                <p className="mt-1 text-xs text-white/35">
                  {equipment?.espressoMachineModel || "-"}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-black/20 text-lg">
                <span className="mt-[4px]">⚙</span>
              </div>
            </div>
          </div>

          {/* Grinder */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">
              آسیاب
            </p>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white/85">
                  {equipment?.grinderBrand || "-"}
                </p>

                <p className="mt-1 text-xs text-white/35">
                  {equipment?.grinderModel || "-"}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-black/20 text-lg">
                <span className="mt-[4px]">⚙</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------
          QC History
      ------------------------------------------------- */}

      <section className="glass rounded-[28px] p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.06] text-lg">
              <Image
                src="/reports.png"
                alt=""
                width={48}
                height={48}
                className="h-10 w-10 object-contain"
              />
            </div>

            <div>
              <h2 className="text-base font-semibold">تاریخچه کنترل کیفیت</h2>

              <p className="mt-1 text-xs text-white/35">
                بازدیدهای قبلی کنترل کیفیت
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-[11px] text-white/40">
            {qcVisits.length.toLocaleString("fa-IR")} بازدید
          </span>
        </div>

        {qcVisits.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-8 text-center md:p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.05] text-xl text-white/40">
              ▤
            </div>

            <p className="mt-4 text-sm font-medium text-white/80">
              هنوز گزارشی ثبت نشده است
            </p>

            <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-white/30">
              برای ایجاد اولین گزارش، یک بازدید جدید کنترل کیفیت شروع کنید.
            </p>

            <Link
              href={`/qc/new?cafeId=${cafe.id}`}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-xs font-medium text-white/70 transition hover:border-[#E17729]/40 hover:bg-[#E17729]/10 hover:text-[#E17729]"
            >
              <span className="text-base">+</span>
              بازدید جدید کنترل کیفیت
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {qcVisits.map((visit) => (
              <div
                key={visit.id}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white/85">
                      {visit.coffeeLine?.name || "لاین قهوه"}
                    </p>

                    <p className="mt-1 text-xs text-white/35">
                      {formatDate(visit.createdAt)}
                    </p>
                  </div>

                  {visit.finalStatus && (
                    <span className="rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-[10px] text-white/50">
                      {visit.finalStatus}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
