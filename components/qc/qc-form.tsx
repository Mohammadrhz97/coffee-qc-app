"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Cafe, CoffeeLine } from "@/lib/types";
type QCFormProps = {
  cafe: Cafe;
  coffeeLine: CoffeeLine;
};

type ShotData = {
  dose: string;
  extractionMass: string;
  time: string;
  temperature: string;

  preInfusionEnabled: boolean;
  preInfusionPressure: string;
  preInfusionDuration: string;

  extractionPressure: string;

  postInfusionEnabled: boolean;
  postInfusionPressure: string;
  postInfusionDuration: string;
};

const steps = ["شات فعلی کافه", "ارزیابی", "تشخیص", "تنظیم من", "نتیجه نهایی"];

const diagnosisOptions = [
  // ── منفی / مشکلات ──
  "Under-extracted",
  "Over-extracted",
  "Fast flow",
  "Slow flow",
  "Channeling",
  "Low body",
  "High bitterness",
  "Low sweetness",
  "High acidity",
  "Temperature issue",
  "Uneven extraction",
  "Weak crema",
  "Sour taste",
  "Harsh finish",

  // ── مثبت ──
  "Balanced espresso",
  "Good body",
  "Good sweetness",
  "Good acidity",
  "Clear flavor notes",
  "Stable flow",
  "Good crema",

  // ── سایر ──
  "Other",
];

export default function QCForm({ cafe, coffeeLine }: QCFormProps) {
  const [step, setStep] = useState(0);
  const [waterTDS, setWaterTDS] = useState("");

  const [customerShot, setCustomerShot] = useState<ShotData>({
    dose: "",
    extractionMass: "",
    time: "",
    temperature: "",

    preInfusionEnabled: false,
    preInfusionPressure: "",
    preInfusionDuration: "",

    extractionPressure: "",

    postInfusionEnabled: false,
    postInfusionPressure: "",
    postInfusionDuration: "",
  });

  const [extraction, setExtraction] = useState("");

  const [body, setBody] = useState("");
  const [acidity, setAcidity] = useState("");
  const [sweetness, setSweetness] = useState("");
  const [bitterness, setBitterness] = useState("");

  const [tastingNotes, setTastingNotes] = useState("");

  const [diagnosis, setDiagnosis] = useState<string[]>([]);

  const [adjustedShot, setAdjustedShot] = useState<ShotData>({
    dose: "",
    extractionMass: "",
    time: "",
    temperature: "",

    preInfusionEnabled: false,
    preInfusionPressure: "",
    preInfusionDuration: "",

    extractionPressure: "",

    postInfusionEnabled: false,
    postInfusionPressure: "",
    postInfusionDuration: "",
  });

  const [notes, setNotes] = useState("");

  const [finalStatus, setFinalStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const customerRatio = useMemo(() => {
    const dose = Number(customerShot.dose);
    const extractionMass = Number(customerShot.extractionMass);

    if (!dose || !extractionMass) {
      return "-";
    }

    return (extractionMass / dose).toFixed(1);
  }, [customerShot.dose, customerShot.extractionMass]);

  const adjustedRatio = useMemo(() => {
    const dose = Number(adjustedShot.dose);
    const extractionMass = Number(adjustedShot.extractionMass);

    if (!dose || !extractionMass) {
      return "-";
    }

    return (extractionMass / dose).toFixed(1);
  }, [adjustedShot.dose, adjustedShot.extractionMass]);

  function updateCustomerShot(field: keyof ShotData, value: string | boolean) {
    setCustomerShot((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateAdjustedShot(field: keyof ShotData, value: string | boolean) {
    setAdjustedShot((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleDiagnosis(value: string) {
    setDiagnosis((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function nextStep() {
    if (step < steps.length - 1) {
      setStep((current) => current + 1);
    }
  }

  function previousStep() {
    if (step > 0) {
      setStep((current) => current - 1);
    }
  }

  async function handleSaveReport() {
    if (saving || saved) return;

    if (step !== steps.length - 1) return;

    if (!finalStatus) {
      setSaveError("لطفاً وضعیت نهایی بازدید را انتخاب کنید.");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch("/api/qc-visits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cafeId: cafe.id,
          coffeeLineId: coffeeLine.id,
          waterTDS,
          customerShot,
          evaluation: {
            extraction,
            body,
            acidity,
            sweetness,
            bitterness,
            tastingNotes,
          },
          diagnosis,
          adjustedShot,
          notes,
          finalStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "ذخیره گزارش با مشکل مواجه شد.");
      }

      setSaved(true);
    } catch (error) {
      console.error("QC save error:", error);
      setSaveError(
        error instanceof Error
          ? error.message
          : "ذخیره گزارش کنترل کیفیت با مشکل مواجه شد.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => (step === 0 ? window.history.back() : previousStep())}
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-lg text-white/40 transition hover:bg-white/[0.08] hover:text-white"
        >
          ←
        </button>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/30">
            کنترل کیفیت
          </p>

          <h1 className="mt-2 truncate text-2xl font-bold tracking-tight md:text-3xl">
            {cafe.name}
          </h1>

          <div className="mt-2">
            <span className="inline-flex rounded-full border border-[#E17729]/15 bg-[#E17729]/10 px-3 py-1.5 text-xs font-medium text-[#E17729]/90">
              ☕ {coffeeLine.name}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="glass rounded-3xl p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/30">
              Step {step + 1} of {steps.length}
            </p>

            <p className="mt-1 text-sm font-semibold text-white/80">
              {steps[step]}
            </p>
          </div>

          <span className="text-xs font-medium text-[#E17729]">
            {Math.round(((step + 1) / steps.length) * 100)}%
          </span>
        </div>

        <div className="mt-4 flex gap-1.5">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition ${
                index <= step
                  ? "bg-[#E17729] shadow-[0_0_10px_rgba(225,119,41,0.35)]"
                  : "bg-white/[0.07]"
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={(event) => event.preventDefault()} className="space-y-4">
        {/* ---------------------------------------------
            STEP 1
        --------------------------------------------- */}

        {step === 0 && (
          <section className="glass rounded-3xl p-5 md:p-6">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.12em] text-white/25">
                مرحله ۰۱
              </p>

              <h2 className="mt-1 text-lg font-semibold">شات فعلی کافه</h2>

              <p className="mt-1 text-xs text-white/30">
                دستور عصاره‌گیری فعلی مورد استفاده در کافه را ثبت کنید.
              </p>
            </div>
            {/* Water TDS */}
            <div className="mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white/80">
                    TDS آب ورودی
                  </p>

                  <p className="mt-1 text-[10px] text-white/30">
                    میزان املاح محلول آب ورودی دستگاه اسپرسو
                  </p>
                </div>

                <div className="flex w-32 items-center gap-2">
                  <input
                    className="input w-full text-center placeholder:text-[10px]"
                    type="number"
                    inputMode="decimal"
                    step="1"
                    min="0"
                    placeholder="مثلاً 120"
                    value={waterTDS}
                    onChange={(event) => setWaterTDS(event.target.value)}
                  />

                  <span className="shrink-0 text-[10px] text-white/30">
                    ppm
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ["dose", "دوز", "g"],
                ["extractionMass", "وزن عصاره", "g"],
                ["time", "زمان", "sec"],
                ["temperature", "دما", "°C"],
              ].map(([field, label, unit]) => (
                <div
                  key={field}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3"
                >
                  <label className="text-[10px] uppercase tracking-[0.1em] text-white/30">
                    {label}
                  </label>

                  <div className="mt-2 flex items-center gap-2">
                    <input
                      className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-white/15"
                      type="number"
                      step="0.1"
                      placeholder="—"
                      value={customerShot[field as keyof ShotData] as string}
                      onChange={(event) =>
                        updateCustomerShot(
                          field as keyof ShotData,
                          event.target.value,
                        )
                      }
                    />

                    <span className="text-[10px] text-white/25">{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Ratio */}
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-[#E17729]/10 bg-[#E17729]/[0.05] px-4 py-3">
              <span className="text-xs text-white/40">نسبت دم‌آوری</span>

              <span className="text-sm font-semibold text-[#E17729]">
                1 به {customerRatio}
              </span>
            </div>

            {/* Pressure */}
            <div className="mt-5 space-y-3">
              <p className="text-xs font-semibold text-white/55">فشار</p>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
                <label className="text-[10px] uppercase tracking-[0.1em] text-white/30">
                  فشار عصاره‌گیری
                </label>

                <div className="mt-2 flex items-center gap-2">
                  <input
                    className="input"
                    type="number"
                    step="0.1"
                    placeholder="۹.۰"
                    value={customerShot.extractionPressure}
                    onChange={(event) =>
                      updateCustomerShot(
                        "extractionPressure",
                        event.target.value,
                      )
                    }
                  />

                  <span className="text-xs text-white/30">بار</span>
                </div>
              </div>

              {/* Pre infusion */}
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">پیش‌دم‌آوری</p>

                    <p className="mt-1 text-[10px] text-white/30">اختیاری</p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateCustomerShot(
                        "preInfusionEnabled",
                        !customerShot.preInfusionEnabled,
                      )
                    }
                    className={`relative h-6 w-11 rounded-full transition ${
                      customerShot.preInfusionEnabled
                        ? "bg-[#E17729]"
                        : "bg-white/[0.1]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                        customerShot.preInfusionEnabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {customerShot.preInfusionEnabled && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <input
                      className="input"
                      type="number"
                      step="0.1"
                      placeholder="فشار (بار)"
                      value={customerShot.preInfusionPressure}
                      onChange={(event) =>
                        updateCustomerShot(
                          "preInfusionPressure",
                          event.target.value,
                        )
                      }
                    />

                    <input
                      className="input"
                      type="number"
                      step="0.1"
                      placeholder="مدت‌زمان (ثانیه)"
                      value={customerShot.preInfusionDuration}
                      onChange={(event) =>
                        updateCustomerShot(
                          "preInfusionDuration",
                          event.target.value,
                        )
                      }
                    />
                  </div>
                )}
              </div>

              {/* Post infusion */}
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">پس‌دم‌آوری</p>

                    <p className="mt-1 text-[10px] text-white/30">اختیاری</p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateCustomerShot(
                        "postInfusionEnabled",
                        !customerShot.postInfusionEnabled,
                      )
                    }
                    className={`relative h-6 w-11 rounded-full transition ${
                      customerShot.postInfusionEnabled
                        ? "bg-[#E17729]"
                        : "bg-white/[0.1]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                        customerShot.postInfusionEnabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {customerShot.postInfusionEnabled && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <input
                      className="input"
                      type="number"
                      step="0.1"
                      placeholder="فشار (بار)"
                      value={customerShot.postInfusionPressure}
                      onChange={(event) =>
                        updateCustomerShot(
                          "postInfusionPressure",
                          event.target.value,
                        )
                      }
                    />

                    <input
                      className="input"
                      type="number"
                      step="0.1"
                      placeholder="مدت‌زمان (ثانیه)"
                      value={customerShot.postInfusionDuration}
                      onChange={(event) =>
                        updateCustomerShot(
                          "postInfusionDuration",
                          event.target.value,
                        )
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ---------------------------------------------
            STEP 2
        --------------------------------------------- */}

        {step === 1 && (
          <section className="glass rounded-3xl p-5 md:p-6">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.12em] text-white/25">
                مرحله ۰۲
              </p>

              <h2 className="mt-1 text-lg font-semibold">ارزیابی</h2>

              <p className="mt-1 text-xs text-white/30">
                شاخصه‌های عصاره گیری فعلی{" "}
              </p>
            </div>

            <div className="space-y-5">
              <EvaluationSlider
                label="Extraction"
                value={extraction}
                onChange={setExtraction}
              />

              <EvaluationSlider label="Body" value={body} onChange={setBody} />

              <EvaluationSlider
                label="Acidity"
                value={acidity}
                onChange={setAcidity}
              />

              <EvaluationSlider
                label="Sweetness"
                value={sweetness}
                onChange={setSweetness}
              />

              <EvaluationSlider
                label="Bitterness"
                value={bitterness}
                onChange={setBitterness}
              />

              <div>
                <label className="text-xs font-medium text-white/55">
                  یادداشت‌های چشایی
                </label>

                <textarea
                  className="input mt-2 min-h-28"
                  placeholder="طعم، رایحه و حس دهانی را توصیف کنید..."
                  value={tastingNotes}
                  onChange={(event) => setTastingNotes(event.target.value)}
                />
              </div>
            </div>
          </section>
        )}

        {/* ---------------------------------------------
            STEP 3
        --------------------------------------------- */}

        {step === 2 && (
          <section className="glass rounded-3xl p-5 md:p-6">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.12em] text-white/25">
                مرحله ۰۳
              </p>

              <h2 className="mt-1 text-lg font-semibold">تشخیص</h2>

              <p className="mt-1 text-xs text-white/30">
                مشکلات شناسایی‌شده را انتخاب کنید.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {diagnosisOptions.map((option) => {
                const active = diagnosis.includes(option);

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleDiagnosis(option)}
                    className={`rounded-2xl border p-3 text-left text-xs transition ${
                      active
                        ? "border-[#E17729]/40 bg-[#E17729]/10 text-[#E17729]"
                        : "border-white/[0.07] bg-white/[0.035] text-white/45 hover:border-white/[0.15] hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md border text-[10px] ${
                          active
                            ? "border-[#E17729] bg-[#E17729] text-white"
                            : "border-white/10 text-transparent"
                        }`}
                      >
                        ✓
                      </span>

                      {option}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ---------------------------------------------
            STEP 4
        --------------------------------------------- */}

        {step === 3 && (
          <section className="glass rounded-3xl p-5 md:p-6">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.12em] text-white/25">
                مرحله ۰۴
              </p>

              <h2 className="mt-1 text-lg font-semibold">تنظیم من</h2>

              <p className="mt-1 text-xs text-white/30">
                دستور عصاره‌گیری پس از تنظیم خود را ثبت کنید.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ["dose", "دوز", "g"],
                ["extractionMass", "وزن عصاره", "g"],
                ["time", "زمان", "sec"],
                ["temperature", "دما", "°C"],
              ].map(([field, label, unit]) => (
                <div
                  key={field}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3"
                >
                  <label className="text-[10px] uppercase tracking-[0.1em] text-white/30">
                    {label}
                  </label>

                  <div className="mt-2 flex items-center gap-2">
                    <input
                      className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-white/15"
                      type="number"
                      step="0.1"
                      placeholder="—"
                      value={adjustedShot[field as keyof ShotData] as string}
                      onChange={(event) =>
                        updateAdjustedShot(
                          field as keyof ShotData,
                          event.target.value,
                        )
                      }
                    />

                    <span className="text-[10px] text-white/25">{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl border border-[#E17729]/10 bg-[#E17729]/[0.05] px-4 py-3">
              <span className="text-xs text-white/40">نسبت دم‌آوری</span>

              <span className="text-sm font-semibold text-[#E17729]">
                1 : {adjustedRatio}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
                <label className="text-[10px] uppercase tracking-[0.1em] text-white/30">
                  فشار عصاره‌گیری
                </label>

                <input
                  className="input mt-2"
                  type="number"
                  step="0.1"
                  placeholder="۹.۰ بار"
                  value={adjustedShot.extractionPressure}
                  onChange={(event) =>
                    updateAdjustedShot("extractionPressure", event.target.value)
                  }
                />
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">پیش‌دم‌آوری</p>

                    <p className="mt-1 text-[10px] text-white/30">اختیاری</p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateAdjustedShot(
                        "preInfusionEnabled",
                        !adjustedShot.preInfusionEnabled,
                      )
                    }
                    className={`relative h-6 w-11 rounded-full transition ${
                      adjustedShot.preInfusionEnabled
                        ? "bg-[#E17729]"
                        : "bg-white/[0.1]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                        adjustedShot.preInfusionEnabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {adjustedShot.preInfusionEnabled && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <input
                      className="input"
                      type="number"
                      step="0.1"
                      placeholder="فشار (بار)"
                      value={adjustedShot.preInfusionPressure}
                      onChange={(event) =>
                        updateAdjustedShot(
                          "preInfusionPressure",
                          event.target.value,
                        )
                      }
                    />

                    <input
                      className="input"
                      type="number"
                      step="0.1"
                      placeholder="مدت‌زمان (ثانیه)"
                      value={adjustedShot.preInfusionDuration}
                      onChange={(event) =>
                        updateAdjustedShot(
                          "preInfusionDuration",
                          event.target.value,
                        )
                      }
                    />
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">پس‌دم‌آوری</p>

                    <p className="mt-1 text-[10px] text-white/30">اختیاری</p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateAdjustedShot(
                        "postInfusionEnabled",
                        !adjustedShot.postInfusionEnabled,
                      )
                    }
                    className={`relative h-6 w-11 rounded-full transition ${
                      adjustedShot.postInfusionEnabled
                        ? "bg-[#E17729]"
                        : "bg-white/[0.1]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                        adjustedShot.postInfusionEnabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {adjustedShot.postInfusionEnabled && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <input
                      className="input"
                      type="number"
                      step="0.1"
                      placeholder="فشار (بار)"
                      value={adjustedShot.postInfusionPressure}
                      onChange={(event) =>
                        updateAdjustedShot(
                          "postInfusionPressure",
                          event.target.value,
                        )
                      }
                    />

                    <input
                      className="input"
                      type="number"
                      step="0.1"
                      placeholder="مدت‌زمان (ثانیه)"
                      value={adjustedShot.postInfusionDuration}
                      onChange={(event) =>
                        updateAdjustedShot(
                          "postInfusionDuration",
                          event.target.value,
                        )
                      }
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-white/55">
                  یادداشت‌ها
                </label>

                <textarea
                  className="input mt-2 min-h-28"
                  placeholder="تنظیمات خود را توضیح دهید..."
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>
            </div>
          </section>
        )}

        {/* ---------------------------------------------
            STEP 5
        --------------------------------------------- */}

        {step === 4 && (
          <section className="glass rounded-3xl p-5 md:p-6">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.12em] text-white/25">
                مرحله ۰۵
              </p>

              <h2 className="mt-1 text-lg font-semibold">نتیجه نهایی</h2>

              <p className="mt-1 text-xs text-white/30">
                نتیجه نهایی بازدید کنترل کیفیت را ثبت کنید.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {["بدون مشکل", "نیازمند پیگیری", "مشکل باقی مانده"].map(
                (option) => {
                  const active = finalStatus === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFinalStatus(option)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-[#E17729]/40 bg-[#E17729]/10 text-[#E17729]"
                          : "border-white/[0.07] bg-white/[0.035] text-white/45 hover:border-white/[0.15]"
                      }`}
                    >
                      <div
                        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${
                          active
                            ? "bg-[#E17729] text-white"
                            : "bg-white/[0.06] text-white/30"
                        }`}
                      >
                        ✓
                      </div>

                      <p className="text-sm font-medium">{option}</p>
                    </button>
                  );
                },
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-[#E17729]/10 bg-[#E17729]/[0.04] p-4">
              <p className="text-xs font-medium text-white/55">
                خلاصه کنترل کیفیت
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-white/25">کافه</p>

                  <p className="mt-1 text-white/70">{cafe.name}</p>
                </div>

                <div>
                  <p className="text-white/25">قهوه</p>

                  <p className="mt-1 text-white/70">{coffeeLine.name}</p>
                </div>

                <div>
                  <p className="text-white/25">نسبت شات فعلی</p>

                  <p className="mt-1 text-white/70">1 : {customerRatio}</p>
                </div>

                <div>
                  <p className="text-white/25">نسبت شات تنظیم‌شده</p>

                  <p className="mt-1 text-white/70">1 به {adjustedRatio}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {saveError && (
          <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-xs leading-5 text-red-200/80">
            {saveError}
          </div>
        )}

        {saved && (
          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-xs leading-5 text-emerald-200/80">
            گزارش کنترل کیفیت در دیتابیس ذخیره شد.
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-1">
          {step > 0 && (
            <>
              {step === steps.length - 1 && saved ? (
                <Link
                  href="/reports"
                  className="flex-1 flex items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-4 text-sm font-medium text-white/60 transition hover:bg-white/[0.07] hover:text-white"
                >
                  مشاهده گزارش‌ها ←
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={previousStep}
                  className="flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-4 text-sm font-medium text-white/60 transition hover:bg-white/[0.07] hover:text-white"
                >
                  ← بازگشت
                </button>
              )}
            </>
          )}

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 rounded-2xl bg-[#E17729] px-5 py-4 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(225,119,41,0.18)] transition hover:bg-[#F08A3D]"
            >
              ادامه ←
            </button>
          ) : (
            <button
              type="button"
              disabled={saving || saved || !finalStatus}
              onClick={handleSaveReport}
              className="flex-1 rounded-2xl bg-[#E17729] px-5 py-4 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(225,119,41,0.18)] transition hover:bg-[#F08A3D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "در حال ذخیره..."
                : saved
                  ? "گزارش ذخیره شد ✓"
                  : !finalStatus
                    ? "ابتدا وضعیت نهایی را انتخاب کنید"
                    : "ذخیره گزارش کنترل کیفیت"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/* -------------------------------------------------
   Evaluation Slider
------------------------------------------------- */

const EVALUATION_LABELS = [
  { max: 1, labelFa: "کم" },
  { max: 3, labelFa: "کم تا متوسط" },
  { max: 5, labelFa: "متوسط" },
  { max: 7, labelFa: "متوسط تا زیاد" },
  { max: 9, labelFa: "زیاد" },
];

function getEvaluationLabel(value: number) {
  return EVALUATION_LABELS.find((item) => value <= item.max);
}

function EvaluationSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const numericValue = value === "" ? 5 : Number(value);
  const currentLabel = getEvaluationLabel(numericValue);

  return (
    <div>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-white/55">{label}</p>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#E17729]">
            {numericValue}
          </span>

          <span className="rounded-full border border-[#E17729]/15 bg-[#E17729]/[0.07] px-2.5 py-1 text-[10px] font-medium text-[#E17729]/90">
            {currentLabel?.labelFa}
          </span>
        </div>
      </div>

      {/* Slider wrapper — dir=ltr تا RTL روش اثر نذاره */}
      <div className="relative" dir="ltr">
        {/* Track */}
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/[0.06]" />

        {/* Range input */}
        <input
          type="range"
          min={1}
          max={9}
          step={1}
          value={numericValue}
          onChange={(event) => onChange(event.target.value)}
          className="
            relative
            z-10
            h-6
            w-full
            cursor-pointer
            appearance-none
            bg-transparent
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-[#E17729]
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(225,119,41,0.5)]
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-[#E17729]
            [&::-moz-range-thumb]:bg-white
          "
        />
      </div>

      {/* Labels — dir=ltr که low چپ، high راست */}
      <div
        className="mt-2 flex justify-between text-[9px] text-white/25"
        dir="ltr"
      >
        <span>low</span>
        <span>medium</span>
        <span>high</span>
      </div>
    </div>
  );
}
