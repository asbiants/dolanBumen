import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cloudinary } from "@/lib/cloudinary";

const prisma = new PrismaClient();

function generateKodeTiket() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${dateStr}-DLNBM${rand}`;
}

interface PengunjungData {
  nama: string;
  usia: number;
  email: string;
}

export async function POST(req: NextRequest) {
  try {
    const { booking, pengunjung } = await req.json();
    const booking_trx_id = booking.booking_trx_id || generateKodeTiket();

    // Upload image to Cloudinary if it's a base64 string
    let proofUrl = booking.proof;
    if (booking.proof && booking.proof.startsWith('data:image')) {
      try {
        const result = await cloudinary.uploader.upload(booking.proof, {
          folder: "payment-proofs",
          resource_type: "auto",
          allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
        });
        proofUrl = result.secure_url;
      } catch (error) {
        console.error("[CLOUDINARY_UPLOAD_ERROR]", error);
        return errorResponse("Gagal upload bukti pembayaran", 500);
      }
    }

    // Prepare booking data with proper types
    const bookingData = {
      nama: booking.nama,
      phone: booking.phone,
      email: booking.email,
      kendaraan: booking.kendaraan,
      jumlah_kendaraan: parseInt(booking.jumlah_kendaraan, 10),
      customer_bank_name: booking.customer_bank_name,
      customer_bank_account: booking.customer_bank_account,
      customer_bank_number: booking.customer_bank_number,
      proof: proofUrl || "-", // Store Cloudinary URL
      tanggal: new Date(booking.tanggal),
      harga_satuan: parseInt(booking.harga_satuan, 10),
      total_amount: parseInt(booking.total_amount, 10),
      is_paid: false,
      quantity: parseInt(booking.quantity, 10),
      booking_trx_id: booking_trx_id,
    };

    // Prepare visitor data with proper types
    const pengunjungData: PengunjungData[] = (pengunjung || []).map((p: any) => ({
      nama: p.nama,
      usia: parseInt(p.usia, 10),
      email: p.email,
    }));

    // Create booking with relations
    const savedBooking = await prisma.booking_transaction.create({
      data: {
        ...bookingData,
        tourist_destination: {
          connect: { id: booking.destinasi_wisata_id }
        },
        proof: proofUrl || "-", // Add proof field here
        user: {
          connect: { id: booking.user_id }
        },
        pengunjung: {
          create: pengunjungData.map((p: PengunjungData) => ({
            ...p,
            tourist_destination: {
              connect: { id: booking.destinasi_wisata_id }
            }
          }))
        }
      },
      include: {
        tourist_destination: true,
        user: true,
        pengunjung: true
      }
    });

    return successResponse(savedBooking, "Booking berhasil disimpan");
  } catch (e) {
    console.error("[BOOKING_CONFIRM_ERROR]", e);
    return errorResponse("Gagal simpan booking", 500);
  }
} 