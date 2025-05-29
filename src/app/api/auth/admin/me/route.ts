import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-for-development";

export async function GET(req: NextRequest) {
  try {
    // Ambil cookie admin-token
    const token = req.cookies.get("admin-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No admin-token" }, { status: 401 });
    }
    // Verifikasi JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; name: string };
    if (!["SUPER_ADMIN", "TOURISM_ADMIN"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized: Not admin" }, { status: 401 });
    }
    // Return user info
    return NextResponse.json({ user: decoded });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
  }
}