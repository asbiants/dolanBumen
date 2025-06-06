import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { successResponse, serverErrorResponse, unauthorizedResponse } from '@/lib/api-utils';
import { getAdminFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromToken();
    if (!admin) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const destinationId = searchParams.get('destinationId');
    const mode = searchParams.get('mode');

    if (mode === 'vehicles') {
      const range = searchParams.get('range') || 'day';
      if (!destinationId) {
        return successResponse([]);
      }
      let kendaraan;
      if (range === 'day') {
        kendaraan = await prisma.booking_transaction.groupBy({
          by: ['kendaraan', 'tanggal'],
          where: { destinasi_wisata_id: destinationId },
          _sum: { jumlah_kendaraan: true },
          orderBy: { tanggal: 'asc' }
        });
      } else if (range === 'week') {
        kendaraan = await prisma.$queryRaw`SELECT kendaraan, DATE_TRUNC('week', tanggal) as tanggal, SUM(jumlah_kendaraan) as total FROM booking_transaction WHERE destinasi_wisata_id = ${destinationId} GROUP BY 1, 2 ORDER BY 2 ASC`;
      } else if (range === 'month') {
        kendaraan = await prisma.$queryRaw`SELECT kendaraan, DATE_TRUNC('month', tanggal) as tanggal, SUM(jumlah_kendaraan) as total FROM booking_transaction WHERE destinasi_wisata_id = ${destinationId} GROUP BY 1, 2 ORDER BY 2 ASC`;
      }
      // Format: [{ kendaraan, tanggal, total }]
      let result = [];
      if (range === 'day') {
        result = (kendaraan as any[]).map((k: any) => ({ jenis: k.kendaraan, tanggal: k.tanggal, total: k._sum.jumlah_kendaraan || 0 }));
      } else {
        result = (kendaraan as any[]).map((k: any) => ({ jenis: k.kendaraan, tanggal: k.tanggal, total: Number(k.total) || 0 }));
      }
      return successResponse(result);
    }

    if (mode === 'income') {
      const range = searchParams.get('range') || 'day';
      let incomePerDay;
      if (range === 'day') {
        incomePerDay = await prisma.booking_transaction.groupBy({
          by: ['tanggal'],
          _sum: { total_amount: true },
          orderBy: { tanggal: 'asc' }
        });
      } else if (range === 'week') {
        incomePerDay = await prisma.$queryRaw`SELECT DATE_TRUNC('week', tanggal) as tanggal, SUM(total_amount) as total FROM booking_transaction GROUP BY 1 ORDER BY 1 ASC`;
      } else if (range === 'month') {
        incomePerDay = await prisma.$queryRaw`SELECT DATE_TRUNC('month', tanggal) as tanggal, SUM(total_amount) as total FROM booking_transaction GROUP BY 1 ORDER BY 1 ASC`;
      }
      // Format: [{ tanggal, total }]
      const incomePerDestination = await prisma.touristDestination.findMany({
        select: {
          id: true,
          name: true,
          booking_transactions: {
            select: { total_amount: true }
          }
        }
      });
      const incomeDest = incomePerDestination.map(d => ({
        id: d.id,
        name: d.name,
        total: d.booking_transactions.reduce((sum, b) => sum + (b.total_amount || 0), 0)
      }));
      // For raw query, map to { tanggal, total }
      let perDay = [];
      if (range === 'day') {
        perDay = (incomePerDay as any[]).map((i: any) => ({ tanggal: i.tanggal, total: i._sum.total_amount || 0 }));
      } else {
        perDay = (incomePerDay as any[]).map((i: any) => ({ tanggal: i.tanggal, total: Number(i.total) || 0 }));
      }
      return successResponse({ perDay, perDestination: incomeDest });
    }

    // Mode pengunjung
    if (mode === 'visitors') {
      const range = searchParams.get('range') || 'day';
      let pengunjung;
      if (range === 'day') {
        pengunjung = await prisma.$queryRaw`SELECT p.destinasi_wisata_id, d.name as nama_destinasi, b.tanggal::date as tanggal, COUNT(*) as total FROM pengunjung p JOIN booking_transaction b ON p.booking_transaction_id = b.id JOIN "tourist_destinations" d ON p.destinasi_wisata_id = d.id GROUP BY 1, 2, 3 ORDER BY 3 ASC`;
      } else if (range === 'week') {
        pengunjung = await prisma.$queryRaw`SELECT p.destinasi_wisata_id, d.name as nama_destinasi, DATE_TRUNC('week', b.tanggal) as tanggal, COUNT(*) as total FROM pengunjung p JOIN booking_transaction b ON p.booking_transaction_id = b.id JOIN "tourist_destinations" d ON p.destinasi_wisata_id = d.id GROUP BY 1, 2, 3 ORDER BY 3 ASC`;
      } else if (range === 'month') {
        pengunjung = await prisma.$queryRaw`SELECT p.destinasi_wisata_id, d.name as nama_destinasi, DATE_TRUNC('month', b.tanggal) as tanggal, COUNT(*) as total FROM pengunjung p JOIN booking_transaction b ON p.booking_transaction_id = b.id JOIN "tourist_destinations" d ON p.destinasi_wisata_id = d.id GROUP BY 1, 2, 3 ORDER BY 3 ASC`;
      }
      // Format: [{ destinasi_wisata_id, nama_destinasi, tanggal, total }]
      let result = (pengunjung as any[]).map((p: any) => ({ destinasi_wisata_id: p.destinasi_wisata_id, nama_destinasi: p.nama_destinasi, tanggal: p.tanggal, total: Number(p.total) || 0 }));
      return successResponse(result);
    }

    // Hitung jumlah pengunjung per destinasi (default)
    const tanggalFilter = searchParams.get('tanggal');
    const kodeFilter = searchParams.get('kode');
    const data = await prisma.touristDestination.findMany({
      select: {
        id: true,
        name: true,
        pengunjung: {
          select: {
            nama: true,
            usia: true,
            email: true,
            booking_transaction: {
              select: {
                tanggal: true,
                booking_trx_id: true
              }
            }
          },
          where: {
            ...(tanggalFilter ? { booking_transaction: { tanggal: new Date(tanggalFilter) } } : {}),
            ...(kodeFilter ? { booking_transaction: { booking_trx_id: kodeFilter } } : {})
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    // Format: [{ id, name, pengunjung: [ { nama, usia, email, booking_transaction: { tanggal, booking_trx_id } } ] }]
    return successResponse(data);
  } catch (error) {
    console.error('[ADMIN_MANAGEMENT_VISITORS_GET]', error);
    return serverErrorResponse();
  }
} 