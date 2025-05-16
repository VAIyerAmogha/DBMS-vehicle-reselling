import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { amount, vehicleId, buyerId } = await req.json();

    if (!amount || !vehicleId || !buyerId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const offer = await prisma.offer.create({
      data: {
        amount,
        vehicleId,
        buyerId,
        status: "pending",
      },
    });

    return NextResponse.json({ message: "Offer created", offer });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}
