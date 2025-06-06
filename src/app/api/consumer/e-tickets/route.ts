import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Use a global variable to reuse the PrismaClient instance across hot-reloads
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const destinations = await prisma.touristDestination.findMany({
      where: {
        // Directly filter for destinations that have at least one AVAILABLE ticket
        tickets: {
          some: {
            status: 'AVAILABLE'
          },
        },
        // Apply category filter if provided
        ...(categoryId && { categoryId: categoryId }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        tickets: { // Include associated tickets (still only AVAILABLE ones)
          select: {
            id: true,
            name: true,
            description: true,
            ticketType: true,
            price: true,
            quotaPerDay: true,
            status: true,
          },
          where: {
            status: 'AVAILABLE' // Keep this to only include AVAILABLE tickets in the result object
          }
        }
      },
      // Optional: Add ordering if needed, e.g., orderBy: { name: 'asc' }
    });

    // The previous filter `destinations.filter(dest => dest.tickets.length > 0)` is no longer strictly necessary
    // because the 'some: { status: 'AVAILABLE' }' in the where clause already ensures destinations
    // have at least one available ticket. However, it doesn't hurt to keep it as an extra safeguard
    // although typically the DB query should be sufficient.
    // For simplicity and relying on the optimized query, let's remove this client-side filter.
    // const filteredDestinations = destinations.filter(dest => dest.tickets.length > 0);

    return NextResponse.json(destinations); // Return destinations directly
  } catch (error) {
    console.error('[API_E_TICKETS_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch e-tickets' }, { status: 500 });
  }
} 