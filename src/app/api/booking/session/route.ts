import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const bookingData = await req.json();
    // Ensure proof field is present
    if (bookingData.booking) {
      bookingData.booking.proof = bookingData.booking.proof || "-";
    }
    const response = successResponse(bookingData, "Booking data held in session");
    response.cookies.set({
      name: "booking-session",
      value: JSON.stringify(bookingData),
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60, // 1 jam
    });
    return response;
  } catch (e) {
    return errorResponse("Gagal hold booking", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get("booking-session");
    if (!cookie) return errorResponse("Data booking tidak ditemukan", 404);
    const data = JSON.parse(cookie.value);
    // Ensure proof field is present
    if (data.booking) {
      data.booking.proof = data.booking.proof || "-";
    }
    return successResponse(data, "Booking data fetched");
  } catch (e) {
    return errorResponse("Gagal mengambil data booking", 500);
  }
} 