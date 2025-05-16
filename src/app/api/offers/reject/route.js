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
    });

    if (!offer || offer.status !== "pending") {
      return NextResponse.json(
        { error: "Offer not valid or already handled" },
        { status: 400 }
      );
    }

    // Update offer status to rejected
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: "rejected" },
    });

    return NextResponse.json({ message: "Offer rejected" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
