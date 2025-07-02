import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";

// Get JWT secret from environment variable or use a fallback for development
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-for-development";

// Define the JWT payload type
interface JwtPayload {
  id: string;
  email: string;
  name: string | null;
  role: string;
  iat?: number;
  exp?: number;
}

export async function GET() {
  try {
    // Get token dari cookies web browser
    const cookieStore = await cookies();
    const authToken = cookieStore.get("admin-token")?.value;

    if (!authToken) {
      return NextResponse.json({ authenticated: false, message: "Autentikasi Token Salah" }, { status: 401 });
    }

    try {
      // Verifikasi dan decode JWT token
      const decoded = jwt.verify(authToken, JWT_SECRET) as JwtPayload;

      // Cek user sesuai dengan ketentuan rolenya
      if (decoded.role !== "SUPER_ADMIN" && decoded.role !== "TOURISM_ADMIN") {
        return NextResponse.json({ authenticated: false, message: "Autentikasi Gagal!" }, { status: 403 });
      }

      // Membawa data dari database apabila autentikasi berhasil
      return NextResponse.json({
        authenticated: true,
        user: {
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
        },
      });
    } catch (jwtError) {
      //
      console.error("JWT validation error:", jwtError);

      return NextResponse.json({ authenticated: false, message: "Token Invalid atau Tidak Sesuai" }, { status: 401 });
    }
  } catch (error) {
    console.error("Authentication check error:", error);
    return NextResponse.json({ authenticated: false, message: "Autentikasi Gagal!" }, { status: 500 });
  }
}
