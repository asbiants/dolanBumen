import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-for-development";

async function getUserFromRequest(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/consumer-token=([^;]+)/);
  if (!match) return null;
  try {
    const decoded = jwt.verify(match[1], JWT_SECRET) as { id: string; email: string; role: string };
    if (decoded.role !== "CONSUMER") return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reviews = await prisma.destinationReview.findMany({
    where: { destinationId: id },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(reviews);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserFromRequest(request);
  if (!user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const formData = await request.formData();
  const comment = formData.get("comment") as string;
  const rating = Number(formData.get("rating"));
  if (!comment || !rating) {
    return new NextResponse("Comment and rating required", { status: 400 });
  }
  const review = await prisma.destinationReview.create({
    data: {
      userId: user.id,
      destinationId: id,
      comment,
      rating,
    },
    include: { user: { select: { name: true } } }
  });
  return NextResponse.json(review);
}
