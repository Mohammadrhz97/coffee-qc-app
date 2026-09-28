import Link from "next/link";
import type { Cafe } from "@/lib/types";
import Image from "next/image";

type CafeCardProps = {
  cafe: Cafe;
};

export default function CafeCard({ cafe }: CafeCardProps) {
  return (
    <Link
      href={`/cafes/${cafe.slug}`}
      className="group glass block rounded-[24px] p-4 transition hover:border-white/20 hover:bg-white/[0.07]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.05] text-xl">
            <Image
              src="/cafe-v2.png"
              alt=""
              width={48}
              height={48}
              className="h-16 w-16 object-contain"
            />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-xl font-bold text-white/90">
              {cafe.name}
            </h3>

            <p className="mt-1 truncate text-xs text-white/35">
              {cafe.manager}
              <span className="mx-1.5 text-white/15">·</span>
              {cafe.region}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/40">
            {cafe.coffeeLines.length.toLocaleString("fa-IR")} لاین
          </span>

          <span className="text-lg text-white/20 transition group-hover:translate-x-1 group-hover:text-[#E17729]">
            →
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-white/[0.06] pt-3">
        <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">
          لاین‌های قهوه
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {cafe.coffeeLines.map((line) => (
            <span
              key={line.id}
              className="rounded-lg border border-[#E17729]/10 bg-[#E17729]/[0.07] px-2.5 py-1.5 text-[10px] font-medium text-[#E17729]/80"
            >
              ☕ {line.name}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <p className="text-[10px] text-white/25">تجهیزات</p>

        <p className="truncate text-[10px] text-white/35">
          {cafe.equipment?.espressoMachineBrand || "-"}
          <span className="mx-1.5 text-white/15">·</span>
          {cafe.equipment?.grinderBrand || "-"}
        </p>
      </div>
    </Link>
  );
}
