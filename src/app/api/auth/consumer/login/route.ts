import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { z } from "zod";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-for-development";

// Validasi skema xod pada form login
const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validasi inputan berdasar zod
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Data tidak valid",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }
    const { email, password } = validationResult.data;
    // Matchng email dari database
    const user = await prisma.user.findUnique({
      where: { email },
    });
    // Validasi role consumer
    if (!user || user.role !== "CONSUMER") {
      return NextResponse.json({ message: "Email atau password salah" }, { status: 401 });
    }
    // Matching password
    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Email atau password salah" }, { status: 401 });
    }
    // Membuat JWT
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    // Generate JWT token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    const response = NextResponse.json({
      message: "Login berhasil",
      user: payload,
      token,
    });
    // SET COOKIE DARI JWT
    response.cookies.set({
      name: "consumer-token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan saat login" }, { status: 500 });
  }
}
