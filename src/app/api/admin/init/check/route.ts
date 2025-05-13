import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // fungsi untuk melakukan cek apakah super admin ada atau tidak didalam sistem
    // dengan fungsi prisma count akan mencari secara keseluruhan didalam database user dengan kondisi role "super admin"
    const superAdminCount = await prisma.user.count({
      where: {
        role: "SUPER_ADMIN",
      },
    });
    //apabila terdapat role "super admin" akan menyimpan atau menghitung jika super admin terdapat dalam sistem
    return NextResponse.json({
      exists: superAdminCount > 0,
      count: superAdminCount,
    });
  } catch (error) {
    console.error("Error checking super admin existence:", error);
    return NextResponse.json({ error: "Failed to check super admin existence" }, { status: 500 });
  }
}
