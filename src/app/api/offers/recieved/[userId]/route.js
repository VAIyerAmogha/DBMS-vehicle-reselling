import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const userId = params.userId;

    const offers = await prisma.offer.findMany({
      where: {
        vehicle: {
          sellerId: userId,
        },
      },
      include: {
        vehicle: true,
        buyer: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(offers);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}
