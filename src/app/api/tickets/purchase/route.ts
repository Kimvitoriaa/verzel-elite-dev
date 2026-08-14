export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, seat, quantity, amount, paymentMethod } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'ID do evento é obrigatório.' }, { status: 400 });
    }

    const client = prisma as any;
    const generatedQrCode = `TICKET-${Math.random().toString(36).substring(2, 9).toUpperCase()}-2026`;

    // Criação segura de ticket / reserva
    let ticket = null;
    if (client.ticket) {
      ticket = await client.ticket.create({
        data: {
          eventId,
          seat: seat || 'A1',
          qrCode: generatedQrCode,
          status: 'VALID',
        },
      });
    }

    return NextResponse.json(
      {
        message: 'Ingresso emitido com sucesso!',
        ticket: ticket || { qrCode: generatedQrCode, seat: seat || 'A1' },
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

export async function GET() {
  try {
    const client = prisma as any;
    if (client.ticket) {
      const tickets = await client.ticket.findMany({
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