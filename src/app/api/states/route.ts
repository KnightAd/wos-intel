import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "whiteout-admin-2024";

// Admin only: add a new state
export async function POST(req: Request) {
  try {
    const { state_number, description, secret } = await req.json();

    if (secret !== ADMIN_SECRET) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!state_number) {
      return NextResponse.json({ message: "State number is required" }, { status: 400 });
    }

    const existingState = await prisma.state.findUnique({
      where: { state_number: parseInt(state_number) },
    });

    if (existingState) {
      return NextResponse.json({ message: "State already exists", stateId: existingState.id }, { status: 400 });
    }

    const state = await prisma.state.create({
      data: {
        state_number: parseInt(state_number),
        description: description || "",
      },
    });

    return NextResponse.json({ message: "State created successfully", state }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
