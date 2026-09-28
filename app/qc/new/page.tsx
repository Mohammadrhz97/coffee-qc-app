"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { Cafe } from "@/lib/types";
import QCForm from "@/components/qc/qc-form";
import AddCafeForm from "@/components/qc/add-cafe-form";

function NewQCPageContent() {
  const searchParams = useSearchParams();

  const cafeId = searchParams.get("cafeId");
  const lineId = searchParams.get("lineId");

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCafeId, setSelectedCafeId] = useState(cafeId || "");
  const [selectedLineId, setSelectedLineId] = useState(lineId || "");

  const [showAddCafe, setShowAddCafe] = useState(false);
  const [search, setSearch] = useState("");

  // -------------------------------------------------
  // LOAD CAFES FROM DATABASE
  // -------------------------------------------------

  const loadCafes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/cafes");

      if (!response.ok) {
        throw new Error("Failed to fetch cafes");
      }

      const data: Cafe[] = await response.json();

      setCafes(data);
    } catch (error) {
      console.error("Load cafes error:", error);
      setError("خطا در دریافت لیست کافه‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial database load
  useEffect(() => {
    let cancelled = false;

    async function fetchInitialCafes() {
      try {
        const response = await fetch("/api/cafes");

        if (!response.ok) {
          throw new Error("Failed to fetch cafes");
        }

        const data: Cafe[] = await response.json();

        if (cancelled) return;

        setCafes(data);
        setError("");
        setLoading(false);
      } catch (error) {
        if (cancelled) return;

        console.error("Initial load cafes error:", error);
        setError("خطا در دریافت لیست کافه‌ها");
        setLoading(false);
      }
    }

    fetchInitialCafes();

    return () => {
      cancelled = true;
    };
  }, []);

  // -------------------------------------------------
  // SELECTED CAFE
  // -------------------------------------------------

  const selectedCafe = useMemo(() => {
    if (!selectedCafeId) return undefined;

    return cafes.find((cafe) => cafe.id === selectedCafeId);
  }, [cafes, selectedCafeId]);

  // -------------------------------------------------
  // SELECTED COFFEE LINE
  // -------------------------------------------------

  const selectedLine = useMemo(() => {
    if (!selectedCafe || !selectedLineId) {
      return undefined;
    }

    return selectedCafe.coffeeLines.find((line) => line.id === selectedLineId);
  }, [selectedCafe, selectedLineId]);

  // -------------------------------------------------
  // FILTER CAFES
  // -------------------------------------------------

  const filteredCafes = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return cafes;

    return cafes.filter(
      (cafe) =>
        cafe.name.toLowerCase().includes(value) ||
        cafe.manager?.toLowerCase().includes(value) ||
        cafe.region?.toLowerCase().includes(value) ||
        cafe.coffeeLines.some((line) =>
          line.name.toLowerCase().includes(value),
        ),
    );
  }, [cafes, search]);

  // -------------------------------------------------
  // LOADING
  // -------------------------------------------------

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#E17729]" />

          <p className="mt-4 text-sm text-white/40">
            در حال دریافت اطلاعات کافه‌ها...
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------
  // ERROR
  // -------------------------------------------------

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="glass rounded-[28px] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/10 bg-red-400/[0.06] text-xl">
            !
          </div>

          <p className="mt-4 text-sm font-semibold text-white/80">
            دریافت اطلاعات با مشکل مواجه شد
          </p>

          <p className="mt-2 text-xs text-white/35">{error}</p>

          <button
            type="button"
            onClick={loadCafes}
            className="mt-6 rounded-xl bg-[#E17729] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E17729]/90"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------
  // QC FORM
  // -------------------------------------------------

  if (selectedCafe && selectedLine) {
    return <QCForm cafe={selectedCafe} coffeeLine={selectedLine} />;
  }

  // -------------------------------------------------
  // ADD CAFE
  // -------------------------------------------------

  if (showAddCafe) {
    return (
      <AddCafeForm
        onCancel={() => setShowAddCafe(false)}
        onSaved={async (newCafeId) => {
          await loadCafes();

          setSelectedCafeId(newCafeId);
          setSelectedLineId("");
          setShowAddCafe(false);
        }}
      />
    );
  }

  // -------------------------------------------------
  // SELECT COFFEE LINE
  // -------------------------------------------------

  if (selectedCafe && !selectedLine) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <button
          type="button"
          onClick={() => {
            setSelectedCafeId("");
            setSelectedLineId("");
          }}
          className="inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white/80"
        >
          <span className="text-lg">←</span>
          بازگشت به کافه‌ها
        </button>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/30">
            کنترل کیفیت
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            انتخاب لاین قهوه
          </h1>

          <p className="mt-2 text-sm text-white/35">{selectedCafe.name}</p>
        </div>

        <section>
          <div className="mb-4">
            <h2 className="text-base font-semibold">لاین‌های قهوه</h2>

            <p className="mt-1 text-xs text-white/30">
              قهوه‌ای را که می‌خواهید بررسی کنید انتخاب کنید.
            </p>
          </div>

          {selectedCafe.coffeeLines.length === 0 ? (
            <div className="glass rounded-[24px] p-8 text-center">
              <p className="text-sm text-white/50">
                این کافه هنوز لاین قهوه‌ای ندارد.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedCafe.coffeeLines.map((line) => (
                <button
                  key={line.id}
                  type="button"
                  onClick={() => setSelectedLineId(line.id)}
                  className="group glass flex w-full items-center justify-between rounded-[24px] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.07]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E17729]/10 bg-[#E17729]/[0.07] text-xl">
                      ☕
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white/90">
                        {line.name}
                      </p>

                      <p className="mt-1 text-xs text-white/30">لاین قهوه</p>
                    </div>
                  </div>

                  <span className="text-xl text-white/20 transition group-hover:translate-x-1 group-hover:text-[#E17729]">
                    →
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // -------------------------------------------------
  // SELECT CAFE
  // -------------------------------------------------

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/30">
          کنترل کیفیت
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          بازدید جدید کنترل کیفیت
        </h1>

        <p className="mt-2 text-sm text-white/35">
          برای شروع بازدید کنترل کیفیت، یک کافه انتخاب کنید.
        </p>
      </div>

      {/* Add Cafe */}
      <button
        type="button"
        onClick={() => setShowAddCafe(true)}
        className="group relative w-full overflow-hidden rounded-[24px] border border-[#E17729]/30 bg-[#E17729]/10 p-5 text-left transition hover:bg-[#E17729]/15"
      >
        <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-[#E17729]/10 blur-[60px]" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E17729] text-2xl text-white shadow-[0_8px_30px_rgba(225,119,41,0.25)]">
              +
            </div>

            <div>
              <p className="text-sm font-semibold text-white/90">
                افزودن کافه جدید
              </p>

              <p className="mt-1 text-xs text-white/35">
                قبل از شروع کنترل کیفیت یک کافه ثبت کنید
              </p>
            </div>
          </div>

          <span className="text-xl text-[#E17729]/70 transition group-hover:translate-x-1">
            →
          </span>
        </div>
      </button>

      {/* Search */}
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/25">
          ⌕
        </div>

        <input
          type="text"
          placeholder="جستجوی کافه، مدیر یا منطقه..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="input pl-11"
        />
      </div>

      {/* Cafes */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">انتخاب کافه</h2>

            <p className="mt-1 text-xs text-white/30">
              کافه‌ای را که می‌خواهید بازدید کنید انتخاب کنید.
            </p>
          </div>

          <span className="rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-[10px] text-white/35">
            {filteredCafes.length.toLocaleString("fa-IR")} کافه
          </span>
        </div>

        <div className="space-y-3">
          {filteredCafes.map((cafe) => (
            <button
              key={cafe.id}
              type="button"
              onClick={() => {
                setSelectedCafeId(cafe.id);
                setSelectedLineId("");
              }}
              className="group glass w-full rounded-[24px] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.05] text-lg">
                    ☕
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white/90">
                      {cafe.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-white/35">
                      {cafe.manager || "-"}
                      <span className="mx-1.5 text-white/15">·</span>
                      {cafe.region || "-"}
                    </p>
                  </div>
                </div>

                <span className="text-xl text-white/20 transition group-hover:translate-x-1 group-hover:text-[#E17729]">
                  →
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {cafe.coffeeLines.map((line) => (
                  <span
                    key={line.id}
                    className="rounded-lg border border-[#E17729]/10 bg-[#E17729]/[0.07] px-2.5 py-1 text-[10px] text-[#E17729]/80"
                  >
                    ☕ {line.name}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {filteredCafes.length === 0 && (
          <div className="glass mt-3 rounded-[28px] p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.05] text-xl text-white/30">
              ⌕
            </div>

            <p className="mt-4 text-sm font-medium text-white/70">
              کافه‌ای پیدا نشد
            </p>

            <p className="mt-2 text-xs text-white/30">
              جستجوی دیگری انجام دهید یا یک کافه جدید اضافه کنید.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default function NewQCPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
          <div className="glass relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/[0.08] px-8 py-10 text-center shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#E17729]/10 blur-3xl" />

            <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#E17729]/10" />
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#E17729] border-r-[#E17729]/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#E17729] shadow-[0_0_18px_rgba(225,119,41,0.8)]" />
            </div>

            <div className="relative mt-6">
              <h3 className="text-sm font-semibold text-white/80">
                در حال آماده‌سازی
              </h3>
              <p className="mt-2 text-xs leading-6 text-white/35">
                اطلاعات کنترل کیفیت در حال دریافت است...
              </p>
            </div>

            <div className="relative mt-5 flex justify-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E17729]/70" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E17729]/50 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E17729]/30 [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      }
    >
      <NewQCPageContent />
    </Suspense>
  );
}
