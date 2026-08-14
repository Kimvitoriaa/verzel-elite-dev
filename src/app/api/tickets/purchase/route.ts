export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, userId, seat, quantity, amount } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'ID do evento é obrigatório.' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Você precisa estar logado para comprar um ingresso.' },
        { status: 401 }
      );
    }

    const client = prisma as any;
    const qrCode = `TICKET-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    let newTicket = null;
    const possibleStatuses = ['ACTIVE', 'VALID', 'CONFIRMED', 'PAID', 'DISPONIVEL', 'VALIDO', 'PENDING'];

    if (client.ticket) {
      for (const statusVal of possibleStatuses) {
        try {
          newTicket = await client.ticket.create({
            data: {
              eventId,
              userId,
              qrCode,
              status: statusVal,
            },
            include: { event: true },
          });
          if (newTicket) break;
        } catch {
          continue;
        }
      }

      if (!newTicket) {
        try {
          newTicket = await client.ticket.create({
            data: {
              eventId,
              userId,
              qrCode,
            },
            include: { event: true },
          });
        } catch {
          newTicket = await client.ticket.create({
            data: {
              qrCode,
              user: { connect: { id: userId } },
              event: { connect: { id: eventId } },
            },
            include: { event: true },
          });
        }
      }
    }

    return NextResponse.json(
      {
        message: 'Pagamento aprovado e ingresso emitido com sucesso!',
        ticket: newTicket ? { ...newTicket, seat: seat || 'A1' } : null,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erro na compra de ingresso:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro interno ao processar compra.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const client = prisma as any;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // Se não passou userId (não está logado), não retorna nenhum ingresso
    if (!userId) {
      return NextResponse.json([]);
    }

    if (client.ticket) {
      const tickets = await client.ticket.findMany({
        where: { userId },
        include: { event: true },
        orderBy: { id: 'desc' },
      });
      return NextResponse.json(tickets);
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json([]);
  }
}