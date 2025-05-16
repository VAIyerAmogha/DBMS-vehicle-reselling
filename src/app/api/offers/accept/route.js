import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { offerId } = await req.json();

    if (!offerId) {
      return NextResponse.json({ error: "Missing offerId" }, { status: 400 });
    }

    // Get the offer
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { vehicle: true },
    });

    if (!offer || offer.status !== "pending") {
      return NextResponse.json(
        { error: "Offer not valid or already handled" },
        { status: 400 }
      );
    }

    // 1. Mark this offer as accepted
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: "accepted" },
    });

    // 2. Reject all other offers for the same vehicle
    await prisma.offer.updateMany({
      where: {
        vehicleId: offer.vehicleId,
        id: { not: offerId },
        status: "pending",
      },
      data: { status: "rejected" },
    });

    // 3. Mark vehicle as sold
    await prisma.vehicle.update({
      where: { id: offer.vehicleId },
      data: { status: "sold" },
    });

    // 4. Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        vehicleId: offer.vehicleId,
        buyerId: offer.buyerId,
        amount: offer.amount,
        date: new Date(),
      },
    });

    return NextResponse.json({
      message: "Offer accepted and transaction recorded",
      transaction,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
