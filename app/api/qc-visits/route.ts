import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function optionalNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalInt(value: unknown): number | null {
  const parsed = optionalNumber(value);
  return parsed === null ? null : Math.round(parsed);
}

export async function GET() {
  try {
    const visits = await db.qCVisit.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        cafe: { select: { id: true, name: true, slug: true, region: true } },
        coffeeLine: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(visits);
  } catch (error) {
    console.error("GET /api/qc-visits error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت گزارش‌های کنترل کیفیت." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      cafeId,
      coffeeLineId,
      waterTDS,
      customerShot,
      evaluation,
      diagnosis,
      adjustedShot,
      notes,
      finalStatus,
    } = body;

    if (!cafeId || !coffeeLineId) {
      return NextResponse.json(
        { error: "کافه و لاین قهوه مشخص نشده است." },
        { status: 400 },
      );
    }

    const coffeeLine = await db.coffeeLine.findUnique({
      where: { id: coffeeLineId },
      select: { id: true, cafeId: true },
    });

    if (!coffeeLine) {
      return NextResponse.json(
        { error: "لاین قهوه پیدا نشد." },
        { status: 404 },
      );
    }

    if (coffeeLine.cafeId !== cafeId) {
      return NextResponse.json(
        { error: "لاین قهوه متعلق به این کافه نیست." },
        { status: 400 },
      );
    }

    const cafe = await db.cafe.findUnique({
      where: { id: cafeId },
      select: { id: true },
    });

    if (!cafe) {
      return NextResponse.json(
        { error: "کافه پیدا نشد." },
        { status: 404 },
      );
    }

    const visit = await db.qCVisit.create({
      data: {
        cafeId,
        coffeeLineId,
        waterTDS: optionalInt(waterTDS),
        customerDose: optionalNumber(customerShot?.dose),
        customerExtractionMass: optionalNumber(customerShot?.extractionMass),
        customerTime: optionalNumber(customerShot?.time),
        customerTemperature: optionalNumber(customerShot?.temperature),
        customerExtractionPressure: optionalNumber(customerShot?.extractionPressure),
        customerPreInfusionEnabled: Boolean(customerShot?.preInfusionEnabled),
        customerPreInfusionPressure: optionalNumber(customerShot?.preInfusionPressure),
        customerPreInfusionDuration: optionalNumber(customerShot?.preInfusionDuration),
        customerPostInfusionEnabled: Boolean(customerShot?.postInfusionEnabled),
        customerPostInfusionPressure: optionalNumber(customerShot?.postInfusionPressure),
        customerPostInfusionDuration: optionalNumber(customerShot?.postInfusionDuration),
        extraction: evaluation?.extraction || null,
        body: evaluation?.body || null,
        acidity: evaluation?.acidity || null,
        sweetness: evaluation?.sweetness || null,
        bitterness: evaluation?.bitterness || null,
        tastingNotes: evaluation?.tastingNotes?.trim() || null,
        diagnosis:
          Array.isArray(diagnosis) && diagnosis.length > 0
            ? JSON.stringify(diagnosis)
            : null,
        adjustedDose: optionalNumber(adjustedShot?.dose),
        adjustedExtractionMass: optionalNumber(adjustedShot?.extractionMass),
        adjustedTime: optionalNumber(adjustedShot?.time),
        adjustedTemperature: optionalNumber(adjustedShot?.temperature),
        adjustedExtractionPressure: optionalNumber(adjustedShot?.extractionPressure),
        adjustedPreInfusionEnabled: Boolean(adjustedShot?.preInfusionEnabled),
        adjustedPreInfusionPressure: optionalNumber(adjustedShot?.preInfusionPressure),
        adjustedPreInfusionDuration: optionalNumber(adjustedShot?.preInfusionDuration),
        adjustedPostInfusionEnabled: Boolean(adjustedShot?.postInfusionEnabled),
        adjustedPostInfusionPressure: optionalNumber(adjustedShot?.postInfusionPressure),
        adjustedPostInfusionDuration: optionalNumber(adjustedShot?.postInfusionDuration),
        notes: notes?.trim() || null,
        finalStatus: finalStatus || null,
      },
      include: {
        cafe: { select: { id: true, name: true, slug: true } },
        coffeeLine: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    console.error("POST /api/qc-visits error:", error);
    return NextResponse.json(
      { error: "خطا در ذخیره گزارش کنترل کیفیت." },
      { status: 500 },
    );
  }
}
