import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

// validasi skema ke dalam form nanti untuk mendefinisikan setiap jenis data yang diinput
const adminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

//endpoint utama ketika menggunakan API admin/init metode post untuk add data to database
export async function POST(request: Request) {
  try {
    //mengambil data JSON dari body
    const body = await request.json();

    // memvalidasi request bodyy yang diambil dengan menggunakan zod schema admin yang telah didefinisikan diatas ln.9
    const validationResult = adminSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid request body",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data; //apabila sesuai ketentuan langsung diambil datanya

    // mengecek apakah role super admin ada atau tidak
    const superAdminCount = await prisma.user.count({
      where: {
        role: "SUPER_ADMIN", // menggunakan prismaclient metode count (mencari keseluruhan data di dalam data base)
      },
    });

    // apabila terdapat email atau role superadmin dalam sistem, maka akses untuk membuat akun super admin diberhentikan
    if (superAdminCount > 0) {
      return NextResponse.json({ message: "Super admin already exists" }, { status: 403 });
    }

    // fungsi untuk mengecek apakah email sudah pernah digunakan untuk mendaftar atau belum
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email is already in use" }, { status: 400 });
    }

    // fungsi untuk mengenkripsi password ke dalam basisdata (bcrypt)
    const hashedPassword = await bcrypt.hash(password, 10);

    // apabila kondisi terpenuhi, langsung menyimpan data ke dalam basis data (create)
    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "SUPER_ADMIN", // settingan default untuk atribut data role
        name: "Super Admin", // settingan default untuk atribut data nama
      },
    });

    // Return respon apabila akun berhasil dibuat
    return NextResponse.json(
      {
        message: "Super admin created successfully",
        user: {
          id: newAdmin.id,
          email: newAdmin.email,
          role: newAdmin.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating super admin:", error);
    return NextResponse.json({ message: "Failed to create super admin" }, { status: 500 });
  }
}
