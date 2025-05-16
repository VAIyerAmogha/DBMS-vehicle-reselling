import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req, { params }) {
  try {
    const vehicleId = params.vehicleId;
    const { title, description, make, model, year, price, status } =
      await req.json();

    if (!title || !description || !make || !model || !year || !price) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        title,
        description,
        make,
        model,
        year: parseInt(year),
        price: parseFloat(price),
        status: status || "available",
      },
    });

    return NextResponse.json({
      message: "Vehicle updated",
      vehicle: updatedVehicle,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update vehicle" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const vehicleId = params.vehicleId;

    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    return NextResponse.json({ message: "Vehicle deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete vehicle" },
      { status: 500 }
    );
  }
}
