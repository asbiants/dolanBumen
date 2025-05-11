import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check if any super admin exists
    const superAdminCount = await prisma.user.count({
      where: {
        role: "SUPER_ADMIN",
      },
    });

    return NextResponse.json({
      exists: superAdminCount > 0,
      count: superAdminCount,
    });
  } catch (error) {
    console.error("Error checking super admin existence:", error);
    return NextResponse.json(
      { error: "Failed to check super admin existence" },
      { status: 500 }
    );
  }
}
