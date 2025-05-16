import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST: Add a new vehicle (unchanged)
export async function POST(req) {
  try {
    const { title, description, make, model, year, price, sellerId } =
      await req.json();

    if (
      !title ||
      !description ||
      !make ||
      !model ||
      !year ||
      !price ||
      !sellerId
    ) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        title,
        description,
        make,
        model,
        year: parseInt(year),
        price: parseFloat(price),
        status: "available",
        sellerId,
      },
    });

    return NextResponse.json({ message: "Vehicle created", vehicle });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// GET: Get vehicles, optionally filtered by sellerId
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const sellerId = url.searchParams.get("sellerId");

    let whereClause = { status: "available" };

    // If sellerId query param is provided, filter vehicles by that sellerId
    if (sellerId) {
      whereClause = { sellerId };
    }

    const vehicles = await prisma.vehicle.findMany({
      where: whereClause,
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(vehicles);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}
