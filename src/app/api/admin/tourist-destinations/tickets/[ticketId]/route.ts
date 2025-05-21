import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TicketType, TicketStatus } from "@prisma/client";

export async function DELETE(req: Request,
    { params }: { params: { ticketId: string } }
) {
    try {
        const { ticketId } = params;

        if (!ticketId) {
            return new NextResponse("Ticket ID is required", { status: 400 });
        }

        const deletedTicket = await prisma.ticket.delete({
            where: {
                id: ticketId,
            },
        });

        return NextResponse.json(deletedTicket);
    } catch (error) {
        console.error("[TICKET_DELETE]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PATCH(req: Request,
    { params }: { params: { ticketId: string } }
) {
    try {
        const { ticketId } = params;
        const formData = await req.formData();

        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const ticketType = formData.get("ticketType") as TicketType;
        const price = Number(formData.get("price"));
        const quotaPerDay = Number(formData.get("quotaPerDay"));
        const status = formData.get("status") as TicketStatus;

        if (!ticketId) {
            return new NextResponse("Ticket ID is required", { status: 400 });
        }

        const updatedTicket = await prisma.ticket.update({
            where: {
                id: ticketId,
            },
            data: {
                name: name || undefined, // Only update if provided
                description: description || undefined,
                ticketType: ticketType || undefined,
                price: !isNaN(price) ? price : undefined,
                quotaPerDay: !isNaN(quotaPerDay) ? quotaPerDay : undefined,
                status: status || undefined,
            },
        });

        return NextResponse.json(updatedTicket);
    } catch (error) {
        console.error("[TICKET_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
} 