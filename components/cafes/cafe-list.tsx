"use client";

import { useEffect, useMemo, useState } from "react";
import type { Cafe } from "@/lib/types";
import CafeCard from "./cafe-card";

export default function CafeList() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchCafes() {
      try {
        const response = await fetch("/api/cafes");

        if (!response.ok) {
          throw new Error("خطا در دریافت لیست کافه‌ها");
        }

        const data: Cafe[] = await response.json();

        if (cancelled) return;

        setCafes(data);
        setError("");
        setLoading(false);
      } catch (err) {
        if (cancelled) return;

        console.error(err);
        setError("دریافت اطلاعات کافه‌ها با مشکل مواجه شد.");
        setLoading(false);
      }
    }

    fetchCafes();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCafes = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return cafes;

    return cafes.filter((cafe) =>
      [
        cafe.name,
        cafe.manager ?? "",
        cafe.region ?? "",
        ...cafe.coffeeLines.map((line) => line.name),
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [cafes, search]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
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
              در حال آماده‌سازی لیست کافه‌ها
            </h3>

            <p className="mt-2 text-xs leading-6 text-white/35">
              اطلاعات کافه‌ها در حال دریافت است...
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

  if (error) {
    return (
      <div className="glass rounded-[28px] p-10 text-center">
        <p className="text-sm font-medium text-red-300/80">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-white/60"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/25">
          ⌕
        </div>

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="جستجوی کافه، مدیر یا قهوه..."
          className="input pl-11"
        />
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-semibold text-white/80">
          {filteredCafes.length.toLocaleString("fa-IR")} کافه
        </p>

        <p className="text-[11px] text-white/25">
          {search ? "نتایج جستجو" : "همه کافه‌های ثبت‌شده"}
        </p>
      </div>

      <div className="space-y-3">
        {filteredCafes.map((cafe) => (
          <CafeCard key={cafe.id} cafe={cafe} />
        ))}
      </div>

      {filteredCafes.length === 0 && (
        <div className="glass rounded-[28px] p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.05] text-xl text-white/30">
            ⌕
          </div>

          <p className="mt-4 text-sm font-medium text-white/70">
            کافه‌ای پیدا نشد
          </p>

          <p className="mt-2 text-xs text-white/30">جستجوی دیگری انجام دهید.</p>
        </div>
      )}
    </div>
  );
}
