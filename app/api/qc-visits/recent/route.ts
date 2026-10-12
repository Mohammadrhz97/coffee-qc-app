import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const visits = await db.qCVisit.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        finalStatus: true,
        extraction: true,
        cafe: { select: { id: true, name: true, slug: true } },
        coffeeLine: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(visits);
  } catch (error) {
    console.error("GET /api/qc-visits/recent error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت بازدیدهای اخیر." },
      { status: 500 },
    );
  }
}
