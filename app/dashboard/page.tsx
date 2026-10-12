"use client";
import Link from "next/link";
import Image from "next/image";
import type { Cafe, RecentVisit } from "@/lib/types";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type DashboardCafe = Cafe & {
  qcVisits?: { createdAt: string }[];
};

function getRelativeDate(date?: string) {
  if (!date) return "هنوز بازدیدی ثبت نشده";

  const today = new Date();
  const visitDate = new Date(date);

  const diffTime = today.getTime() - visitDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "امروز";
  if (diffDays === 1) return "دیروز";

  return `${diffDays} روز پیش`;
}

export default function DashboardPage() {
  const [cafes, setCafes] = useState<DashboardCafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [cafesRes, visitsRes] = await Promise.all([
          fetch("/api/cafes"),
          fetch("/api/qc-visits/recent"),
        ]);

        if (!cafesRes.ok) throw new Error("خطا در دریافت اطلاعات کافه‌ها");

        const cafesData: DashboardCafe[] = await cafesRes.json();
        const visitsData: RecentVisit[] = visitsRes.ok
          ? await visitsRes.json()
          : [];

        if (cancelled) return;

        setCafes(cafesData);
        setRecentVisits(visitsData);
        setError("");
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError("دریافت اطلاعات داشبورد با مشکل مواجه شد.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalCafes = cafes.length;

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
              در حال آماده‌سازی داشبورد
            </h3>

            <p className="mt-2 text-xs leading-6 text-white/35">
              اطلاعات داشبورد در حال دریافت است...
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
      <div className="mx-auto max-w-5xl">
        <div className="glass rounded-[28px] p-12 text-center">
          <p className="text-sm text-red-300/80">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-white/60"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            داشبورد
          </h1>

          <p className="mt-2 text-sm text-white/35">
            مدیریت کافه‌ها و بازدیدهای کنترل کیفیت.
          </p>
        </div>
      </div>

      {/* New QC */}
      <Link
        href="/qc/new"
        className="group relative block overflow-hidden rounded-[28px] border border-[#E17729]/40 bg-gradient-to-br from-[#E17729] via-[#C85F1D] to-[#9F4716] p-5 shadow-[0_15px_50px_rgba(225,119,41,0.18)] transition hover:scale-[1.005] hover:shadow-[0_20px_60px_rgba(225,119,41,0.25)] md:p-6"
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-[80px]" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl">
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

      {/* Overview */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold">نمای کلی</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Link
            href="/cafes"
            className="glass rounded-[24px] p-5 transition hover:border-white/20 hover:bg-white/[0.07]"
          >
            <div className="flex items-center justify-between">
              <Image
                src="/cafe-v2.png"
                alt=""
                width={40}
                height={40}
                className="h-8 w-8 object-contain"
              />

              <span className="text-white/20">→</span>
            </div>

            <p className="mt-5 text-3xl font-bold">{totalCafes}</p>

            <p className="mt-1 text-xs text-white/35">کافه‌ها</p>
          </Link>

          <div className="glass rounded-[24px] p-5">
            <div className="flex items-center justify-between">
              <Image
                src="/cafe-v2.png"
                alt=""
                width={40}
                height={40}
                className="h-8 w-8 object-contain"
              />

              <span className="rounded-full bg-white/[0.05] px-2 py-1 text-[10px] text-white/30">
                به‌زودی
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold">0</p>

            <p className="mt-1 text-xs text-white/35">بازدیدهای کنترل کیفیت</p>
          </div>
        </div>
      </section>

      {/* Cafes */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-base font-semibold">کافه‌ها</h2>

            <p className="mt-1 text-xs text-white/30">کافه‌های ثبت‌شده شما</p>
          </div>

          <Link
            href="/cafes"
            className="text-xs font-medium text-[#E17729] transition hover:text-[#F08A3D]"
          >
            مشاهده همه ←
          </Link>
        </div>

        <CafeDepthCarousel cafes={cafes} />
      </section>

      {/* Recent QC */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-base font-semibold">
              تاریخچه اخیر کنترل کیفیت
            </h2>
            <p className="mt-1 text-xs text-white/30">
              آخرین بازدیدهای کنترل کیفیت
            </p>
          </div>
          <Link href="/reports" className="text-xs font-medium text-[#E17729]">
            مشاهده همه ←
          </Link>
        </div>

        {recentVisits.length === 0 ? (
          // Empty state (همون کد قبلی)
          <div className="glass rounded-[28px] p-8 text-center md:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.05] text-xl text-white/30">
              ▤
            </div>
            <p className="mt-4 text-sm font-medium text-white/75">
              هنوز گزارشی ثبت نشده است
            </p>
            <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-white/30">
              برای ایجاد اولین گزارش کنترل کیفیت، یک بازدید جدید شروع کنید.
            </p>
            <Link
              href="/qc/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-xs font-medium text-white/60 transition hover:border-[#E17729]/40 hover:bg-[#E17729]/10 hover:text-[#E17729]"
            >
              <span className="text-base">+</span>
              بازدید جدید کنترل کیفیت
            </Link>
          </div>
        ) : (
          // لیست بازدیدهای اخیر
          <div className="space-y-2">
            {recentVisits.map((visit) => (
              <Link
                key={visit.id}
                href={`/reports/${visit.id}`}
                className="glass group flex items-center justify-between rounded-[22px] p-4 transition hover:border-[#E17729]/30 hover:bg-white/[0.07]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#E17729]/15 bg-[#E17729]/[0.07] text-base">
                    ☕
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white/85">
                      {visit.cafe.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-white/35">
                      {visit.coffeeLine.name}
                      {visit.extraction && (
                        <>
                          <span className="mx-1.5 text-white/15">·</span>
                          {visit.extraction}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-[10px] text-white/30">
                    {getRelativeDate(visit.createdAt)}
                  </span>
                  <span className="text-[#E17729] opacity-0 transition group-hover:opacity-100">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CafeDepthCarousel({ cafes }: { cafes: DashboardCafe[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const total = cafes.length;

  if (total === 0) {
    return (
      <div className="glass flex h-[300px] items-center justify-center rounded-[28px]">
        <div className="text-center">
          <p className="text-sm text-white/50">هنوز کافه‌ای ثبت نشده است</p>
          <Link
            href="/cafes"
            className="mt-4 inline-flex rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-white/60"
          >
            افزودن کافه
          </Link>
        </div>
      </div>
    );
  }

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % total);
  };

  const goPrevious = () => {
    setActiveIndex((current) => (current - 1 + total) % total);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    // فقط اسکرول عمودی را کنترل کن
    if (Math.abs(event.deltaY) < 10) return;

    // نذار wheel به صفحه اصلی منتقل بشه
    event.preventDefault();

    if (event.deltaY > 0) {
      goNext();
    } else {
      goPrevious();
    }
  };

  const getPosition = (index: number) => {
    let difference = index - activeIndex;

    if (difference > total / 2) {
      difference -= total;
    }

    if (difference < -total / 2) {
      difference += total;
    }

    return difference;
  };

  return (
    <div
      className="
        relative
        h-[460px]
        w-full
        overflow-hidden
        touch-pan-y
        overscroll-contain
      "
      onWheel={handleWheel}
    >
      {/* Ambient glow */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          z-0
          h-64
          w-64
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[#E17729]/10
          blur-[100px]
        "
      />

      <AnimatePresence initial={false}>
        {cafes.map((cafe, index) => {
          const position = getPosition(index);

          /*
            فقط کارت‌های نزدیک به کارت فعال
          */
          if (Math.abs(position) > 2) {
            return null;
          }

          const isActive = position === 0;

          /*
            فاصله عمودی کارت‌ها
          */
          const y = position === 0 ? 0 : position > 0 ? 190 : -190;

          /*
            اندازه کارت‌ها
          */
          const scale =
            position === 0 ? 1 : Math.abs(position) === 1 ? 0.84 : 0.7;

          /*
            شفافیت
          */
          const opacity =
            position === 0 ? 1 : Math.abs(position) === 1 ? 0.42 : 0.18;

          /*
            Blur
          */
          const blur = position === 0 ? 0 : Math.abs(position) === 1 ? 4 : 8;

          /*
            چرخش سه‌بعدی
          */
          const rotateX = position === 0 ? 0 : position > 0 ? -7 : 7;

          return (
            <motion.div
              key={cafe.id}
              className="
                absolute
                left-1/2
                top-1/2
                w-[calc(100%-16px)]
                max-w-4xl
                touch-pan-y
                select-none
              "
              initial={{
                opacity: 0,
                scale: 0.65,
                y: y + 50,
              }}
              animate={{
                opacity,
                scale,
                y: `calc(-50% + ${y}px)`,
                x: "-50%",
                rotateX,
                filter: `blur(${blur}px)`,
              }}
              transition={{
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                zIndex: 20 - Math.abs(position),
                transformPerspective: 1000,
              }}
              onClick={() => {
                if (!isDragging && !isActive) {
                  setActiveIndex(index);
                }
              }}
              drag="y"
              dragDirectionLock
              dragConstraints={{
                top: 0,
                bottom: 0,
              }}
              dragElastic={0.08}
              dragMomentum={false}
              whileDrag={{
                scale: isActive ? 1 : scale,
              }}
              onDragStart={() => {
                setIsDragging(true);
              }}
              onDragEnd={(_, info) => {
                setIsDragging(false);

                const offset = info.offset.y;

                if (offset < -60) {
                  goNext();
                  return;
                }

                if (offset > 60) {
                  goPrevious();
                  return;
                }
              }}
            >
              <Link
                href={`/cafes/${cafe.slug}`}
                draggable={false}
                onClick={(event) => {
                  if (isDragging) {
                    event.preventDefault();
                    event.stopPropagation();
                  }
                }}
                className={`
                  group
                  block
                  rounded-[28px]
                  ${
                    isActive
                      ? "glass border border-white/[0.12] shadow-[0_25px_80px_rgba(0,0,0,0.45)]"
                      : "border border-white/[0.05] bg-white/[0.035]"
                  }
                  p-5
                  transition-colors
                  duration-300
                  md:p-6
                `}
              >
                {/* Active glow */}
                {isActive && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
                    <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#E17729]/10 blur-[70px]" />
                  </div>
                )}

                <div className="relative">
                  {/* Top */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div
                        className={`
                          flex
                          h-14
                          w-14
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          border
                          ${
                            isActive
                              ? "border-[#E17729]/20 bg-[#E17729]/10"
                              : "border-white/[0.06] bg-white/[0.04]"
                          }
                        `}
                      >
                        <Image
                          src="/cafe-v2.png"
                          alt=""
                          width={48}
                          height={48}
                          className="h-10 w-10 object-contain"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3
                          className={`
                            truncate
                            font-semibold
                            ${
                              isActive
                                ? "text-base text-white"
                                : "text-sm text-white/70"
                            }
                          `}
                        >
                          {cafe.name}
                        </h3>

                        <p className="mt-1 truncate text-xs text-white/35">
                          {cafe.manager}

                          <span className="mx-1.5 text-white/15">·</span>

                          {cafe.region}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`
                        shrink-0
                        text-xl
                        transition
                        ${isActive ? "text-[#E17729]" : "text-white/15"}
                      `}
                    >
                      →
                    </span>
                  </div>

                  {/* Last QC */}
                  <div
                    className="
                      mt-5
                      flex
                      items-center
                      justify-between
                      rounded-2xl
                      border
                      border-white/[0.05]
                      bg-black/20
                      px-4
                      py-3
                    "
                  >
                    <span className="text-[10px] text-white/30">
                      آخرین بازدید کنترل کیفیت
                    </span>

                    <span
                      className={`
                        text-xs
                        font-medium
                        ${isActive ? "text-[#E17729]" : "text-white/40"}
                      `}
                    >
                      {getRelativeDate(cafe.qcVisits?.[0]?.createdAt)}
                    </span>
                  </div>

                  {/* Coffee Lines */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {cafe.coffeeLines.map((line) => (
                      <span
                        key={line.id}
                        className={`
                          rounded-xl
                          border
                          px-3
                          py-1.5
                          text-[10px]
                          ${
                            isActive
                              ? "border-[#E17729]/15 bg-[#E17729]/[0.07] text-[#E17729]/80"
                              : "border-white/[0.05] bg-white/[0.03] text-white/25"
                          }
                        `}
                      >
                        ☕ {line.name}
                      </span>
                    ))}
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="mt-5 flex items-center justify-center gap-1.5">
                      {cafes.map((_, dotIndex) => (
                        <button
                          key={dotIndex}
                          type="button"
                          aria-label={`رفتن به کافه ${dotIndex + 1}`}
                          onPointerDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();

                            if (!isDragging) {
                              setActiveIndex(dotIndex);
                            }
                          }}
                          className={`
                            h-1.5
                            rounded-full
                            transition-all
                            duration-300
                            ${
                              dotIndex === activeIndex
                                ? "w-6 bg-[#E17729]"
                                : "w-1.5 bg-white/15 hover:bg-white/30"
                            }
                          `}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Swipe hint */}
      <div className="pointer-events-none absolute bottom-2 left-1/2 z-30 -translate-x-1/2">
        <p className="text-[9px] tracking-wide text-white/20">
          برای جابه‌جایی بکشید
        </p>
      </div>
    </div>
  );
}
