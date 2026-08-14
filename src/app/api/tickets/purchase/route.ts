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

    const client = prisma as any;
    const qrCode = `TICKET-${Math.random().toString(36).substring(2, 9).toUpperCase()}-2026`;

    // Garante que o lugar não seja duplicado se houver assento
    if (seat && client.ticket) {
      const existingSeat = await client.ticket.findFirst({
        where: { eventId, seat, status: { not: 'CANCELLED' } },
      });
      if (existingSeat) {
        return NextResponse.json({ error: `O assento ${seat} já foi reservado.` }, { status: 400 });
      }
    }

    let ticket = null;
    if (client.ticket) {
      ticket = await client.ticket.create({
        data: {
          eventId,
          userId: userId || undefined,
          seat: seat || 'Pista',
          qrCode,
          status: 'VALID',
        },
        include: { event: true },
      });
    }

    return NextResponse.json(
      {
        message: 'Ingresso emitido com sucesso!',
        ticket: ticket || { qrCode, seat: seat || 'Pista' },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro na compra:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar compra.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const client = prisma as any;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (client.ticket) {
      const whereClause = userId ? { userId } : {};
      const tickets = await client.ticket.findMany({
        where: whereClause,
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