import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for request body
const adminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request body
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

    const { email, password } = validationResult.data;

    // Check if a super admin already exists
    const superAdminCount = await prisma.user.count({
      where: {
        role: "SUPER_ADMIN", // Using the mapped value from schema.prisma
      },
    });

    // If a super admin already exists, reject the request
    if (superAdminCount > 0) {
      return NextResponse.json(
        { message: "Super admin already exists" },
        { status: 403 }
      );
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already in use" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the super admin user
    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "SUPER_ADMIN", // Using the mapped value from schema.prisma
        name: "Super Admin", // Default name, can be updated later
      },
    });

    // Return success response (without sensitive data)
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
    return NextResponse.json(
      { message: "Failed to create super admin" },
      { status: 500 }
    );
  }
}
