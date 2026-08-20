import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const users = await prisma.user.findMany({
    select: { email: true, name: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({
    users,
    password: "demo1234",
    note: "Seeded demo accounts. Sharing works between these emails.",
  });
}
