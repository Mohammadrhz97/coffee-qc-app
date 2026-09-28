import Link from "next/link";
import CafeList from "@/components/cafes/cafe-list";

export default function CafesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            کافه‌ها
          </h1>

          <p className="mt-2 text-sm text-white/35">
            مدیریت کافه‌ها، لاین‌های قهوه و تجهیزات.
          </p>
        </div>

        <Link
          href="/qc/new"
          className="hidden shrink-0 items-center gap-2 rounded-xl border border-[#E17729]/30 bg-[#E17729]/10 px-4 py-2.5 text-xs font-semibold text-[#E17729] transition hover:bg-[#E17729]/15 sm:flex"
        >
          <span className="text-base">+</span>
          افزودن کافه{" "}
        </Link>
      </div>

      {/* Search / List */}
      <CafeList />
    </div>
  );
}
