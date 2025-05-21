import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TicketType } from "@prisma/client";

/*
1. tiket dewasa - usia >17 thn - weekend 100k
2. tiket dewasa - usia >17 thn - weekday 80k
*/

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const destinationId = formData.get("destinationId") as string;
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const ticketType = formData.get("ticketType") as string;
        const price = Number(formData.get("price"));
        const quotaPerDay = Number(formData.get("quotaPerDay"));


        const destination = await prisma.touristDestination.findUnique({
            where: {
                id: destinationId,
            },
        });

        if (!destination) {
            return new NextResponse("Destination not found", { status: 404 });
        }

        const ticket = await prisma.ticket.create({
            data: {
                destinationId,
                name,
                description,
                ticketType: ticketType as TicketType,
                price,
                quotaPerDay,
            },
        });

        return NextResponse.json(ticket);
    } catch (error) {
        console.error("[TICKET_POST]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const destinationId = searchParams.get("destinationId");

        if (!destinationId) {
            return new NextResponse("Destination ID is required", { status: 400 });
        }

        const tickets = await prisma.ticket.findMany({
            where: {
                destinationId,
            },
        });

        return NextResponse.json(tickets);
        
    } catch (error) {
        console.error("[TICKET_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
