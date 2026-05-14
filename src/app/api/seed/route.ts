import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "whiteout-admin-2024";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const TOTAL = 4500;
    const BATCH_SIZE = 500; // Larger batches are fine on Postgres
    let created = 0;

    for (let start = 1; start <= TOTAL; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE - 1, TOTAL);
      const batch = [];
      for (let i = start; i <= end; i++) {
        batch.push({ state_number: i });
      }
      
      // createMany with skipDuplicates works on PostgreSQL!
      const result = await prisma.state.createMany({
        data: batch,
        skipDuplicates: true,
      });
      created += result.count;
    }

    const total = await prisma.state.count();
    return NextResponse.json({ success: true, created, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Seed failed", error: String(error) }, { status: 500 });
  }
}
