import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;

    const cafe = await db.cafe.findUnique({
      where: { slug: decodeURIComponent(slug) },
      include: {
        equipment: true,
        coffeeLines: {
          orderBy: { createdAt: "asc" },
        },
        qcVisits: {
          orderBy: { createdAt: "desc" },
          include: { coffeeLine: true },
        },
      },
    });

    if (!cafe) {
      return NextResponse.json({ error: "کافه پیدا نشد" }, { status: 404 });
    }

    return NextResponse.json(cafe);
  } catch (error) {
    console.error("GET /api/cafes/[slug] error:", error);

    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات کافه" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const currentSlug = decodeURIComponent(slug);

    const currentCafe = await db.cafe.findUnique({
      where: { slug: currentSlug },
      include: {
        coffeeLines: {
          select: {
            id: true,
            name: true,
            _count: { select: { qcVisits: true } },
          },
        },
      },
    });

    if (!currentCafe) {
      return NextResponse.json({ error: "کافه پیدا نشد" }, { status: 404 });
    }

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
      .map((line: { id?: string; name?: string } | string) => ({
        id: typeof line === "string" ? undefined : line?.id,
        name: (typeof line === "string" ? line : line?.name || "").trim(),
      }))
      .filter((line) => line.name !== "");

    if (cleanCoffeeLines.length === 0) {
      return NextResponse.json(
        { error: "حداقل یک لاین قهوه لازم است." },
        { status: 400 },
      );
    }

    const submittedExistingIds = cleanCoffeeLines
      .map((line) => line.id)
      .filter((id): id is string => Boolean(id));

    const existingIds = new Set(currentCafe.coffeeLines.map((line) => line.id));
    const idsToKeep = submittedExistingIds.filter((id) => existingIds.has(id));
    const idsToDelete = currentCafe.coffeeLines
      .filter((line) => line._count.qcVisits === 0)
      .map((line) => line.id)
      .filter((id) => !idsToKeep.includes(id));

    const updatedCafe = await db.$transaction(async (tx) => {
      const updated = await tx.cafe.update({
        where: { id: currentCafe.id },
        data: {
          name: name.trim(),
          manager: manager.trim(),
          phone: phone.trim(),
          region: region.trim(),
          equipment: {
            upsert: {
              create: {
                espressoMachineBrand: equipment?.espressoMachineBrand?.trim() || null,
                espressoMachineModel: equipment?.espressoMachineModel?.trim() || null,
                grinderBrand: equipment?.grinderBrand?.trim() || null,
                grinderModel: equipment?.grinderModel?.trim() || null,
              },
              update: {
                espressoMachineBrand: equipment?.espressoMachineBrand?.trim() || null,
                espressoMachineModel: equipment?.espressoMachineModel?.trim() || null,
                grinderBrand: equipment?.grinderBrand?.trim() || null,
                grinderModel: equipment?.grinderModel?.trim() || null,
              },
            },
          },
          coffeeLines: {
            ...(idsToDelete.length > 0
              ? { deleteMany: { id: { in: idsToDelete } } }
              : {}),
            update: idsToKeep.map((id) => {
              const submitted = cleanCoffeeLines.find((line) => line.id === id)!;
              return { where: { id }, data: { name: submitted.name } };
            }),
            create: cleanCoffeeLines
              .filter((line) => !line.id || !existingIds.has(line.id))
              .map((line) => ({ name: line.name })),
          },
        },
        include: {
          equipment: true,
          coffeeLines: { orderBy: { createdAt: "asc" } },
          qcVisits: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { id: true, createdAt: true },
          },
        },
      });

      return updated;
    });

    return NextResponse.json(updatedCafe);
  } catch (error) {
    console.error("PUT /api/cafes/[slug] error:", error);

    return NextResponse.json(
      { error: "خطا در ویرایش کافه" },
      { status: 500 },
    );
  }
}
