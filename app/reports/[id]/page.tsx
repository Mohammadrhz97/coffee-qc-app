"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const faNumber = new Intl.NumberFormat("fa-IR");

const statusStyles: Record<string, string> = {
  متعادل: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  "نیازمند پیگیری": "border-amber-400/20 bg-amber-400/10 text-amber-300",
  "مشکل باقی مانده": "border-red-400/20 bg-red-400/10 text-red-300",
};

type Visit = {
  id: string;
  createdAt: string;
  waterTDS: number | null;

  customerDose: number | null;
  customerExtractionMass: number | null;
  customerTime: number | null;
  customerTemperature: number | null;
  customerExtractionPressure: number | null;
  customerPreInfusionEnabled: boolean;
  customerPreInfusionPressure: number | null;
  customerPreInfusionDuration: number | null;
  customerPostInfusionEnabled: boolean;
  customerPostInfusionPressure: number | null;
  customerPostInfusionDuration: number | null;

  extraction: string | null;
  body: string | null;
  acidity: string | null;
  sweetness: string | null;
  bitterness: string | null;
  tastingNotes: string | null;

  diagnosis: string | null;

  adjustedDose: number | null;
  adjustedExtractionMass: number | null;
  adjustedTime: number | null;
  adjustedTemperature: number | null;
  adjustedExtractionPressure: number | null;
  adjustedPreInfusionEnabled: boolean;
  adjustedPreInfusionPressure: number | null;
  adjustedPreInfusionDuration: number | null;
  adjustedPostInfusionEnabled: boolean;
  adjustedPostInfusionPressure: number | null;
  adjustedPostInfusionDuration: number | null;

  notes: string | null;
  finalStatus: string | null;

  cafe: {
    id: string;
    name: string;
    slug: string;
    region: string | null;
  };
  coffeeLine: {
    id: string;
    name: string;
  };
};

type ReportData = {
  cafe: Visit["cafe"];
  date: string;
  visits: Visit[];
};

function formatDate(date: string) {
  const parts = new Intl.DateTimeFormat("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(new Date(date));

  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const year = parts.find((part) => part.type === "year")?.value ?? "";

  return `${weekday}، ${day} ${month} ${year}`;
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function value(value: number | string | null | undefined, unit = "") {
  if (value === null || value === undefined || value === "") return "—";
  return `${typeof value === "number" ? faNumber.format(value) : value}${unit ? ` ${unit}` : ""}`;
}

function ratio(dose: number | null, mass: number | null) {
  if (!dose || !mass) return "—";
  return `1:${(mass / dose).toFixed(1)}`;
}

function diagnosisList(raw: string | null) {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
  } catch {
    // Older records may contain plain text.
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function statusClass(status: string | null) {
  return (
    statusStyles[status || ""] ||
    "border-white/[0.07] bg-white/[0.04] text-white/45"
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass overflow-hidden rounded-[28px]">
      <div className="border-b border-white/[0.06] px-5 py-5 md:px-7">
        <h2 className="mt-1 text-base font-semibold md:text-lg">{title}</h2>
        {eyebrow && (
          <p className="text-[10px] font-medium tracking-[0.12em] text-[#E17729]/50">
            {eyebrow}
          </p>
        )}
      </div>
      <div className="p-5 md:p-7">{children}</div>
    </section>
  );
}

function Metric({
  label,
  value: metricValue,
  unit,
  highlight = false,
}: {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
      <p className="text-[10px] text-white/30">{label}</p>
      <p
        className={`mt-2 text-sm font-semibold ${
          highlight ? "text-[#E17729]" : "text-white/80"
        }`}
      >
        {metricValue}
        {unit && (
          <span className="m-1 text-[10px] font-norma text-white/30">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}

function ShotCard({
  title,
  subtitle,
  shot,
  adjusted = false,
}: {
  title: string;
  subtitle: string;
  shot: Visit;
  adjusted?: boolean;
}) {
  const dose = adjusted ? shot.adjustedDose : shot.customerDose;
  const mass = adjusted
    ? shot.adjustedExtractionMass
    : shot.customerExtractionMass;
  const time = adjusted ? shot.adjustedTime : shot.customerTime;
  const temperature = adjusted
    ? shot.adjustedTemperature
    : shot.customerTemperature;
  const extractionPressure = adjusted
    ? shot.adjustedExtractionPressure
    : shot.customerExtractionPressure;
  const preEnabled = adjusted
    ? shot.adjustedPreInfusionEnabled
    : shot.customerPreInfusionEnabled;
  const prePressure = adjusted
    ? shot.adjustedPreInfusionPressure
    : shot.customerPreInfusionPressure;
  const preDuration = adjusted
    ? shot.adjustedPreInfusionDuration
    : shot.customerPreInfusionDuration;
  const postEnabled = adjusted
    ? shot.adjustedPostInfusionEnabled
    : shot.customerPostInfusionEnabled;
  const postPressure = adjusted
    ? shot.adjustedPostInfusionPressure
    : shot.customerPostInfusionPressure;
  const postDuration = adjusted
    ? shot.adjustedPostInfusionDuration
    : shot.customerPostInfusionDuration;

  return (
    <div className="rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-4 md:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white/85">{title}</h3>
          <p className="mt-1 text-[10px] text-white/30">{subtitle}</p>
        </div>
        <div className="rounded-xl border border-[#E17729]/15 bg-[#E17729]/[0.07] px-3 py-2 text-center">
          <p className="text-[9px] text-white/30">نسبت</p>
          <p className="mt-0.5 text-sm font-bold text-[#E17729]">
            {ratio(dose, mass)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        <Metric label="دوز" value={value(dose)} unit="g" />
        <Metric label="وزن عصاره" value={value(mass)} unit="g" />
        <Metric label="زمان" value={value(time)} unit="ثانیه" />
        <Metric label="دما" value={value(temperature)} unit="°C" />
        <Metric
          label="فشار استخراج"
          value={value(extractionPressure)}
          unit="بار"
        />
        <Metric
          label="پیش‌دم‌آوری"
          value={
            preEnabled
              ? `${value(prePressure)} / ${value(preDuration)}`
              : "غیرفعال"
          }
          unit={preEnabled ? "bar / sec" : undefined}
        />
        <Metric
          label="پس‌دم‌آوری"
          value={
            postEnabled
              ? `${value(postPressure)} / ${value(postDuration)}`
              : "غیرفعال"
          }
          unit={postEnabled ? "bar / sec" : undefined}
        />
      </div>
    </div>
  );
}

function EvaluationRow({
  label,
  value: item,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-black/15 px-6 py-3">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-xs font-medium text-white/75">
        {item || "ثبت نشده"}
      </span>
    </div>
  );
}

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeVisitId, setActiveVisitId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!params.id) return;

    fetch(`/api/qc-visits/${params.id}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("load failed");
        return (await response.json()) as ReportData;
      })
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setActiveVisitId(result.visits[0]?.id || null);
        setLoading(false);
      })
      .catch((requestError) => {
        if (cancelled) return;
        console.error(requestError);
        setError("دریافت جزئیات گزارش با مشکل مواجه شد.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const activeVisit = useMemo(
    () =>
      data?.visits.find((visit) => visit.id === activeVisitId) ||
      data?.visits[0],
    [data, activeVisitId],
  );

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4">
        <div className="glass relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/[0.08] px-8 py-10 text-center shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#E17729]/10 blur-[70px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/[0.03] blur-[70px]" />

          <div className="relative">
            {/* Spinner */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/[0.08] bg-white/[0.04]">
              <div className="relative h-9 w-9">
                <div className="absolute inset-0 rounded-full border-[3px] border-white/[0.08]" />

                <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[#E17729] border-r-[#E17729]/40" />

                <div className="absolute inset-[9px] rounded-full bg-[#E17729]/10 shadow-[0_0_20px_rgba(225,119,41,0.15)]" />
              </div>
            </div>

            {/* Text */}
            <h3 className="mt-6 text-sm font-semibold text-white/80">
              در حال آماده‌سازی گزارش
            </h3>

            <p className="mt-2 text-xs leading-6 text-white/35">
              اطلاعات کنترل کیفیت در حال دریافت است...
            </p>

            {/* Loading dots */}
            <div className="mt-5 flex items-center justify-center gap-1.5">
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E17729]"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E17729]/70"
                style={{ animationDelay: "180ms" }}
              />
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E17729]/40"
                style={{ animationDelay: "360ms" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data || !activeVisit) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="glass rounded-[28px] p-12 text-center">
          <p className="text-sm text-red-300/80">
            {error || "گزارش پیدا نشد."}
          </p>
          <Link
            href="/reports"
            className="mt-4 inline-flex rounded-xl bg-white/[0.06] px-4 py-2 text-xs text-white/60"
          >
            بازگشت به گزارش‌ها
          </Link>
        </div>
      </div>
    );
  }

  const diagnoses = diagnosisList(activeVisit.diagnosis);
  console.log(activeVisit.finalStatus);

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-10 md:space-y-7">
      <Link
        href="/reports"
        className="inline-flex items-center gap-2 text-xs text-white/40 transition hover:text-white/70"
      >
        ← بازگشت به گزارش‌ها
      </Link>

      {/* Header */}
      <div className="glass relative overflow-hidden rounded-[30px] p-5 md:p-7">
        <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[#E17729]/10 blur-[90px]" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{data.cafe.name}</h1>
            <p className="text-[10px] text-[#E17729]/70">
              گزارش بازدید کنترل کیفیت
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/35">
              {data.cafe.region && <span>{data.cafe.region}</span>}
              <span>·</span>
              <span>{formatDate(data.date)}</span>
              <span>·</span>
              <span>{formatTime(data.date)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:min-w-[330px]">
            <div className="rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3 text-center">
              <p className="text-[9px] text-white/30">لاین‌های بررسی‌شده</p>
              <p className="mt-1 text-lg font-bold text-white/80">
                {faNumber.format(data.visits.length)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3 text-center">
              <p className="text-[9px] text-white/30">لاین انتخاب‌شده</p>
              <p className="mt-1 truncate text-sm font-semibold text-[#E17729]">
                {activeVisit.coffeeLine.name}
              </p>
            </div>
            <div className="col-span-2 rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3 text-center sm:col-span-1">
              <p className="text-[9px] text-white/30">وضعیت نهایی</p>
              <p className="mt-1 text-sm font-semibold text-white/75">
                {activeVisit.finalStatus || "ثبت نشده"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Line selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {data.visits.map((visit) => {
          const active = visit.id === activeVisit.id;
          return (
            <button
              key={visit.id}
              type="button"
              onClick={() => setActiveVisitId(visit.id)}
              className={`shrink-0 rounded-2xl border px-4 py-3 text-right transition ${
                active
                  ? "border-[#E17729]/35 bg-[#E17729]/10"
                  : "border-white/[0.07] bg-white/[0.035] hover:border-white/[0.14]"
              }`}
            >
              <span
                className={`block text-xs font-semibold ${active ? "text-[#E17729]" : "text-white/65"}`}
              >
                {visit.coffeeLine.name}
              </span>
              <span className="mt-1 block text-[9px] text-white/30">
                {visit.finalStatus || "وضعیت ثبت نشده"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Water */}
      <Section eyebrow="WATER QUALITY" title="کیفیت آب ورودی">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric
            label="TDS آب"
            value={value(activeVisit.waterTDS)}
            unit="ppm"
            highlight
          />
          <div className="col-span-1 rounded-2xl border border-white/[0.06] bg-black/15 p-4 sm:col-span-2">
            <p className="text-[10px] text-white/30">برداشت</p>
            <p className="mt-2 text-xs leading-6 text-white/55">
              TDS آب در زمان بازدید ثبت شده و به همین گزارش QC مربوط است.
            </p>
          </div>
        </div>
      </Section>

      {/* Customer shot */}
      <Section eyebrow="CUSTOMER SHOT" title="شات فعلی کافه">
        <ShotCard
          title="Recipe فعلی کافه"
          subtitle="پارامترهایی که قبل از هرگونه تنظیم ثبت شده‌اند"
          shot={activeVisit}
        />
      </Section>

      {/* Evaluation */}
      <Section eyebrow="TASTING & EVALUATION" title="ارزیابی قهوه">
        <div className="grid gap-2 grid-cols-3">
          <EvaluationRow label="استخراج" value={activeVisit.extraction} />
          <EvaluationRow label="بادی" value={activeVisit.body} />
          <EvaluationRow label="اسیدیته" value={activeVisit.acidity} />
          <EvaluationRow label="شیرینی" value={activeVisit.sweetness} />
          <EvaluationRow label="تلخی" value={activeVisit.bitterness} />
        </div>

        {activeVisit.tastingNotes && (
          <div className="mt-3 rounded-2xl border border-[#E17729]/10 bg-[#E17729]/[0.035] p-4">
            <p className="text-[10px] text-[#E17729]/65">
              توصیف حسی / یادداشت طعمی
            </p>
            <p className="mt-2 text-sm leading-7 text-white/70">
              {activeVisit.tastingNotes}
            </p>
          </div>
        )}
      </Section>

      {/* Diagnosis */}
      <Section eyebrow="DIAGNOSIS" title="مشکلات شناسایی‌شده">
        {diagnoses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {diagnoses.map((item) => (
              <span
                key={item}
                className="rounded-xl border border-red-400/15 bg-red-400/[0.06] px-3 py-2 text-xs text-red-200/75"
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-white/35">موردی ثبت نشده است.</p>
        )}
      </Section>

      {/* Adjustment */}
      <Section eyebrow="MY ADJUSTMENT" title="تنظیم انجام‌شده توسط QC">
        <ShotCard
          title="Recipe پیشنهادی / تنظیم‌شده"
          subtitle="پارامترهای شات پس از تنظیم"
          shot={activeVisit}
          adjusted
        />
      </Section>

      {/* Notes & result */}
      <Section eyebrow="FINAL RESULT" title="نتیجه و جمع‌بندی">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.06] bg-black/15 p-4">
            <p className="text-[10px] text-white/30">وضعیت نهایی</p>
            <span
              className={`mt-3 inline-flex rounded-xl border px-3 py-2 text-xs font-medium ${statusClass(
                activeVisit.finalStatus,
              )}`}
            >
              {activeVisit.finalStatus || "ثبت نشده"}
            </span>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-black/15 p-4">
            <p className="text-[10px] text-white/30">زمان ثبت گزارش</p>
            <p className="mt-3 text-sm text-white/70">
              {formatTime(activeVisit.createdAt)}
            </p>
          </div>
        </div>

        {activeVisit.notes && (
          <div className="mt-3 rounded-2xl border border-white/[0.06] bg-black/15 p-4">
            <p className="text-[10px] text-white/30">یادداشت نهایی QC</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/65">
              {activeVisit.notes}
            </p>
          </div>
        )}
      </Section>
    </div>
  );
}
