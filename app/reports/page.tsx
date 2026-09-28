"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Visit = {
  id: string;
  cafeId: string;
  coffeeLineId: string;
  createdAt: string;
  finalStatus: string | null;
  cafe: { id: string; name: string; slug: string; region: string | null };
  coffeeLine: { id: string; name: string };
};

type ReportGroup = {
  key: string;
  cafeName: string;
  region: string | null;
  date: string;
  firstVisitId: string;
  lines: { id: string; name: string; status: string | null }[];
};

function dayKey(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function relativeDate(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (diff <= 0) return "امروز";
  if (diff === 1) return "دیروز";
  return `${diff} روز پیش`;
}

function statusClass(status: string | null) {
  if (status === "متعادل")
    return "text-emerald-300/80 bg-emerald-400/10 border-emerald-400/10";
  if (status === "نیازمند پیگیری")
    return "text-amber-300/80 bg-amber-400/10 border-amber-400/10";
  if (status === "مشکل باقی مانده")
    return "text-red-300/80 bg-red-400/10 border-red-400/10";
  return "text-white/40 bg-white/[0.04] border-white/[0.06]";
}

export default function ReportsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/qc-visits")
      .then(async (res) => {
        if (!res.ok) throw new Error("load failed");
        return (await res.json()) as Visit[];
      })
      .then((data) => {
        if (cancelled) return;
        setVisits(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError("دریافت گزارش‌ها با مشکل مواجه شد.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const reports = useMemo(() => {
    const groups = new Map<string, ReportGroup>();
    for (const visit of visits) {
      const key = `${visit.cafeId}-${dayKey(visit.createdAt)}`;
      const group = groups.get(key);
      if (group) {
        if (!group.lines.some((line) => line.id === visit.coffeeLineId)) {
          group.lines.push({
            id: visit.coffeeLineId,
            name: visit.coffeeLine.name,
            status: visit.finalStatus,
          });
        }
      } else {
        groups.set(key, {
          key,
          cafeName: visit.cafe.name,
          region: visit.cafe.region,
          date: visit.createdAt,
          firstVisitId: visit.id,
          lines: [
            {
              id: visit.coffeeLineId,
              name: visit.coffeeLine.name,
              status: visit.finalStatus,
            },
          ],
        });
      }
    }
    const query = search.trim().toLocaleLowerCase("fa-IR");
    return [...groups.values()].filter(
      (r) => !query || r.cafeName.toLocaleLowerCase("fa-IR").includes(query),
    );
  }, [visits, search]);

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
              در حال آماده‌سازی گزارش‌ها
            </h3>

            <p className="mt-2 text-xs leading-6 text-white/35">
              اطلاعات کنترل کیفیت در حال دریافت است...
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

  if (error)
    return (
      <div className="mx-auto max-w-5xl">
        <div className="glass rounded-[28px] p-12 text-center">
          <p className="text-sm text-red-300/80">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-white/60"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl space-y-6 md:space-y-8">
      <div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          گزارش‌ها
        </h1>
        <p className="mt-2 text-sm text-white/35">
          تاریخچه بازدیدهای کنترل کیفیت بر اساس کافه
        </p>
      </div>

      <section className="glass rounded-3xl p-3 md:p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className=" bg-black/40 rounded-3xl w-full h-9 placeholder:text-xs p-3 "
          placeholder="جستجوی نام کافه..."
        />
      </section>

      {reports.length === 0 ? (
        <section className="glass rounded-[28px] p-10 text-center md:p-14">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.05] text-2xl text-white/30">
            <Image
              src="/reports.png"
              alt=""
              width={40}
              height={40}
              className="h-32 w-32 object-contain"
            />
          </div>
          <h2 className="mt-5 text-base font-semibold text-white/80">
            {search ? "کافه‌ای پیدا نشد" : "هنوز گزارشی ثبت نشده است"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/30">
            {search
              ? "نام کافه را تغییر دهید و دوباره جستجو کنید."
              : "بازدیدهای تکمیل‌شده کنترل کیفیت شما اینجا نمایش داده می‌شوند."}
          </p>
          {!search && (
            <Link
              href="/qc/new"
              className="mt-6 inline-flex rounded-xl bg-[#E17729] px-5 py-3 text-xs font-semibold text-white"
            >
              + شروع بازدید جدید کنترل کیفیت
            </Link>
          )}
        </section>
      ) : (
        <section className="space-y-3">
          {reports.map((report) => (
            <Link
              key={report.key}
              href={`/reports/${report.firstVisitId}`}
              className="glass group block rounded-[28px] p-5 transition hover:border-white/20 hover:bg-white/[0.07] md:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-white md:text-lg">
                    {report.cafeName}
                  </h2>
                  {report.region && (
                    <p className="mt-1 text-xs text-white/30">
                      {report.region}
                    </p>
                  )}
                </div>
                <span className="text-xl text-white/20 group-hover:text-[#E17729]">
                  ←
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/[0.05] bg-black/20 px-4 py-3">
                <span className="text-[10px] text-white/30">آخرین بازدید</span>
                <div className="text-left">
                  <span className="block text-xs font-medium text-[#E17729]">
                    {relativeDate(report.date)}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-white/25">
                    {formatDate(report.date)}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 ">
                  {report.lines.map((line) => (
                    <span
                      key={line.id}
                      className="text-xs text-white/65 rounded-2xl border border-white/[0.05] bg-white/[0.025] px-2 py-1"
                    >
                      ☕ {line.name}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
