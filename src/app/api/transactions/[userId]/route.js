import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const userId = params.userId;

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { buyerId: userId },
          {
            vehicle: {
              sellerId: userId,
            },
          },
        ],
      },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        vehicle: {
          include: {
            seller: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(transactions);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
