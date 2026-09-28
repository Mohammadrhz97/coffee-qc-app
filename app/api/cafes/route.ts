import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

async function createUniqueSlug(name: string) {
  const baseSlug = generateSlug(name) || `cafe-${Date.now()}`;
  let slug = baseSlug;
  let counter = 2;

  while (await db.cafe.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function GET() {
  try {
    const cafes = await db.cafe.findMany({
      include: {
        equipment: true,
        coffeeLines: {
          orderBy: { createdAt: "asc" },
        },
        qcVisits: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cafes);
  } catch (error) {
    console.error("GET /api/cafes error:", error);

    return NextResponse.json(
      { error: "خطا در دریافت لیست کافه‌ها" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, manager, phone, region, equipment, coffeeLines } = body;

    if (!name?.trim() || !manager?.trim() || !phone?.trim() || !region?.trim()) {
      return NextResponse.json(
        { error: "اطلاعات الزامی کافه کامل نیست." },
        { status: 400 },
      );
    }

    if (!Array.isArray(coffeeLines) || coffeeLines.length === 0) {
      return NextResponse.json(
        { error: "حداقل یک لاین قهوه لازم است." },
        { status: 400 },
      );
    }

    const cleanCoffeeLines = coffeeLines
      .map((line: { name?: string } | string) =>
        typeof line === "string" ? line.trim() : line?.name?.trim() || "",
      )
      .filter(Boolean);

    if (cleanCoffeeLines.length === 0) {
      return NextResponse.json(
        { error: "حداقل یک لاین قهوه لازم است." },
        { status: 400 },
      );
    }

    const slug = await createUniqueSlug(name);

    const cafe = await db.cafe.create({
      data: {
        name: name.trim(),
        slug,
        manager: manager.trim(),
        phone: phone.trim(),
        region: region.trim(),
        equipment: {
          create: {
            espressoMachineBrand: equipment?.espressoMachineBrand?.trim() || null,
            espressoMachineModel: equipment?.espressoMachineModel?.trim() || null,
            grinderBrand: equipment?.grinderBrand?.trim() || null,
            grinderModel: equipment?.grinderModel?.trim() || null,
          },
        },
        coffeeLines: {
          create: cleanCoffeeLines.map((line: string) => ({ name: line })),
        },
      },
      include: {
        equipment: true,
        coffeeLines: true,
        qcVisits: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, createdAt: true },
        },
      },
    });

    return NextResponse.json(cafe, { status: 201 });
  } catch (error) {
    console.error("POST /api/cafes error:", error);

    return NextResponse.json(
      { error: "خطا در ایجاد کافه" },
      { status: 500 },
    );
  }
}
