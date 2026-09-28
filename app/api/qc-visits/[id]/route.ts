import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    const selected = await db.qCVisit.findUnique({
      where: { id },
      include: {
        cafe: {
          select: {
            id: true,
            name: true,
            slug: true,
            region: true,
          },
        },
        coffeeLine: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!selected) {
      return NextResponse.json(
        { error: "گزارش پیدا نشد." },
        { status: 404 },
      );
    }

    const from = startOfDay(selected.createdAt);
    const to = new Date(from);
    to.setDate(to.getDate() + 1);

    const visits = await db.qCVisit.findMany({
      where: {
        cafeId: selected.cafeId,
        createdAt: {
          gte: from,
          lt: to,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        cafe: {
          select: {
            id: true,
            name: true,
            slug: true,
            region: true,
          },
        },
        coffeeLine: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      cafe: selected.cafe,
      date: selected.createdAt,
      visits,
    });
  } catch (error) {
    console.error("GET /api/qc-visits/[id] error:", error);

    return NextResponse.json(
      { error: "خطا در دریافت جزئیات گزارش." },
      { status: 500 },
    );
  }
}
