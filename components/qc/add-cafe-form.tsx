"use client";

import { useState } from "react";
import type { Cafe } from "@/lib/types";

type AddCafeFormProps = {
  onCancel: () => void;
  onSaved: (cafeId: string) => void | Promise<void>;
  cafe?: Cafe;
};

type CoffeeLineInput = {
  id?: string;
  name: string;
};

export default function AddCafeForm({ onCancel, onSaved, cafe }: AddCafeFormProps) {
  const isEditMode = Boolean(cafe);

  const [name, setName] = useState(cafe?.name || "");
  const [manager, setManager] = useState(cafe?.manager || "");
  const [phone, setPhone] = useState(cafe?.phone || "");
  const [region, setRegion] = useState(cafe?.region || "");

  const [machineBrand, setMachineBrand] = useState(cafe?.equipment?.espressoMachineBrand || "");
  const [machineModel, setMachineModel] = useState(cafe?.equipment?.espressoMachineModel || "");
  const [grinderBrand, setGrinderBrand] = useState(cafe?.equipment?.grinderBrand || "");
  const [grinderModel, setGrinderModel] = useState(cafe?.equipment?.grinderModel || "");

  const [coffeeLines, setCoffeeLines] = useState<CoffeeLineInput[]>(
    cafe?.coffeeLines.map((line) => ({ id: line.id, name: line.name })) || [
      { name: "" },
    ],
  );
  const [saving, setSaving] = useState(false);

  function addCoffeeLine() {
    setCoffeeLines((current) => [...current, { name: "" }]);
  }

  function updateCoffeeLine(index: number, value: string) {
    setCoffeeLines((current) =>
      current.map((line, i) =>
        i === index ? { ...line, name: value } : line,
      ),
    );
  }

  function removeCoffeeLine(index: number) {
    setCoffeeLines((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    if (!name.trim() || !manager.trim() || !phone.trim() || !region.trim()) {
      alert("لطفاً اطلاعات الزامی کافه را کامل کنید.");
      return;
    }

    const validCoffeeLines = coffeeLines
      .map((line) => ({
        id: line.id,
        name: line.name.trim(),
      }))
      .filter((line) => line.name !== "");

    if (validCoffeeLines.length === 0) {
      alert("لطفاً حداقل یک لاین قهوه اضافه کنید.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        manager: manager.trim(),
        phone: phone.trim(),
        region: region.trim(),
        equipment: {
          espressoMachineBrand: machineBrand.trim(),
          espressoMachineModel: machineModel.trim(),
          grinderBrand: grinderBrand.trim(),
          grinderModel: grinderModel.trim(),
        },
        coffeeLines: validCoffeeLines,
      };

      const endpoint = cafe ? `/api/cafes/${encodeURIComponent(cafe.slug)}` : "/api/cafes";
      const response = await fetch(endpoint, {
        method: cafe ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "ذخیره کافه با مشکل مواجه شد.");
      }

      await onSaved(data.id);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "خطا در ذخیره کافه.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-lg text-white/40 transition hover:bg-white/[0.08] hover:text-white"
        >
          ←
        </button>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/30">
            مدیریت کافه
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {isEditMode ? "ویرایش کافه" : "افزودن کافه جدید"}
          </h1>

          <p className="mt-2 text-sm text-white/35">
            {isEditMode
              ? "اطلاعات کافه، تجهیزات و لاین‌های قهوه را به‌روزرسانی کنید."
              : "اطلاعات کافه، تجهیزات و لاین‌های قهوه را اضافه کنید."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cafe Information */}
        <section className="glass rounded-3xl p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.05] text-lg">
              ℹ
            </div>

            <div>
              <h2 className="text-base font-semibold">اطلاعات کافه</h2>

              <p className="mt-1 text-xs text-white/30">اطلاعات پایه کافه</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-white/60">
                نام کافه *
              </label>

              <input
                className="input mt-2"
                placeholder="مثلاً کافه میلانو"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-white/60">
                مالک / مدیر *
              </label>

              <input
                className="input mt-2"
                placeholder="مثلاً رضا احمدی"
                value={manager}
                onChange={(event) => setManager(event.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-white/60">
                  تلفن *
                </label>

                <input
                  className="input mt-2"
                  type="tel"
                  placeholder="مثلاً ۰۹۱۲..."
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-white/60">
                  منطقه *
                </label>

                <input
                  className="input mt-2"
                  type="text"
                  placeholder="مثلاً پاسداران"
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Equipment */}
        <section className="glass rounded-3xl p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.05] text-lg">
              ⚙
            </div>

            <div>
              <h2 className="text-base font-semibold">تجهیزات</h2>

              <p className="mt-1 text-xs text-white/30">
                تجهیزات ذخیره‌شده در پروفایل کافه
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {/* Espresso Machine */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
              <p className="text-xs font-semibold text-white/55">
                دستگاه اسپرسو
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input
                  className="input"
                  placeholder="برند"
                  value={machineBrand}
                  onChange={(event) => setMachineBrand(event.target.value)}
                />

                <input
                  className="input"
                  placeholder="مدل"
                  value={machineModel}
                  onChange={(event) => setMachineModel(event.target.value)}
                />
              </div>
            </div>

            {/* Grinder */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
              <p className="text-xs font-semibold text-white/55">آسیاب</p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input
                  className="input"
                  placeholder="برند"
                  value={grinderBrand}
                  onChange={(event) => setGrinderBrand(event.target.value)}
                />

                <input
                  className="input"
                  placeholder="مدل"
                  value={grinderModel}
                  onChange={(event) => setGrinderModel(event.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Coffee Lines */}
        <section className="glass rounded-3xl p-5 md:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E17729]/15 bg-[#E17729]/10 text-lg">
              ☕
            </div>

            <div>
              <h2 className="text-base font-semibold">لاین‌های قهوه</h2>

              <p className="mt-1 text-xs text-white/30">
                لاین‌های قهوه سرو‌شده در این کافه
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {coffeeLines.map((line, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className="input"
                  placeholder="مثلاً لاین ۱۰۱"
                  value={line.name}
                  onChange={(event) =>
                    updateCoffeeLine(index, event.target.value)
                  }
                />

                {coffeeLines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCoffeeLine(index)}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-400/10 bg-red-400/[0.06] text-lg text-red-300/70 transition hover:bg-red-400/10 hover:text-red-300"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addCoffeeLine}
            className="mt-4 w-full rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-3 text-xs font-medium text-[#E17729] transition hover:border-[#E17729]/30 hover:bg-[#E17729]/[0.05]"
          >
            + افزودن لاین قهوه
          </button>
        </section>

        {/* Save */}
        <button
          type="submit"
          className="group relative flex w-full items-center justify-center overflow-hidden rounded-3xl border border-[#E17729]/40 bg-gradient-to-br from-[#E17729] via-[#C85F1D] to-[#9F4716] px-5 py-4 text-sm font-semibold text-white shadow-[0_15px_45px_rgba(225,119,41,0.16)] transition hover:shadow-[0_20px_55px_rgba(225,119,41,0.24)]"
        >
          {saving ? "در حال ذخیره..." : isEditMode ? "ذخیره تغییرات" : "ذخیره کافه و شروع QC"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-2xl py-3 text-xs font-medium text-white/30 transition hover:text-white/60"
        >
          لغو
        </button>
      </form>
    </div>
  );
}
