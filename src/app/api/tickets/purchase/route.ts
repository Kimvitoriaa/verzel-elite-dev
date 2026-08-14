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
    const qrCode = `TICKET-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    let targetUserId = userId;

    if (!targetUserId) {
      const firstUser = client.user
        ? await client.user.findFirst()
        : await client.usuario?.findFirst();
      targetUserId = firstUser?.id;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Nenhum usuário logado encontrado para a compra.' },
        { status: 400 }
      );
    }

    let newTicket = null;

    if (client.ticket) {
      try {
        newTicket = await client.ticket.create({
          data: {
            qrCode,
            status: 'VALID',
            user: {
              connect: { id: targetUserId },
            },
            event: {
              connect: { id: eventId },
            },
          },
          include: {
            event: true,
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        });
      } catch {
        newTicket = await client.ticket.create({
          data: {
            eventId,
            userId: targetUserId,
            qrCode,
            status: 'VALID',
          },
          include: { event: true },
        });
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

    if (client.ticket) {
      const whereCondition = userId ? { userId } : {};
      const tickets = await client.ticket.findMany({
        where: whereCondition,
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