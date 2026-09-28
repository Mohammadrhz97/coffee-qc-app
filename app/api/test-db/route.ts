import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cafes = await db.cafe.findMany({
      include: {
        equipment: true,
        coffeeLines: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: cafes.length,
      cafes,
    });
  } catch (error) {
    console.error("Database test error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
      },
      { status: 500 },
    );
  }
}
