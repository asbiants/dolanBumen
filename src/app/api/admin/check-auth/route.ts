import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";

// Get JWT secret from environment variable or use a fallback for development
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-for-development";

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
    // Get token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token")?.value;

    if (!authToken) {
      return NextResponse.json(
        { authenticated: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    try {
      // Verify and decode the JWT token
      const decoded = jwt.verify(authToken, JWT_SECRET) as JwtPayload;

      // Check if user is an admin
      if (decoded.role !== "SUPER_ADMIN" && decoded.role !== "TOURISM_ADMIN") {
        return NextResponse.json(
          { authenticated: false, message: "Not authorized" },
          { status: 403 }
        );
      }

      // Return user data without sensitive information
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
      // JWT validation failed
      console.error("JWT validation error:", jwtError);

      return NextResponse.json(
        { authenticated: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Authentication check error:", error);
    return NextResponse.json(
      { authenticated: false, message: "Authentication check failed" },
      { status: 500 }
    );
  }
}
