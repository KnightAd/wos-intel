import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const state_number = searchParams.get("state_number");

  if (!state_number) {
    return NextResponse.json({ message: "State number is required" }, { status: 400 });
  }

  const state = await prisma.state.findUnique({
    where: { state_number: parseInt(state_number) },
  });

  if (state) {
    return NextResponse.json({ stateId: state.id }, { status: 200 });
  } else {
    return NextResponse.json({ message: "State not found" }, { status: 404 });
  }
}
