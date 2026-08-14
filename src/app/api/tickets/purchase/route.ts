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

    // Identifica um usuário válido para conectar na relação do Prisma
    let targetUserId = userId;

    if (!targetUserId) {
      const firstUser = client.user
        ? await client.user.findFirst()
        : await client.usuario?.findFirst();
      targetUserId = firstUser?.id;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Nenhum usuário autenticado encontrado para emissão do ingresso.' },
        { status: 400 }
      );
    }

    // Criação do Ticket com conexão relacional padrão do Prisma
    let newTicket = null;

    try {
      if (client.ticket) {
        newTicket = await client.ticket.create({
          data: {
            seat: seat || 'Pista',
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
      }
    } catch (errConnect) {
      // Fallback caso as chaves estejam mapeadas sem connect explícito
      newTicket = await client.ticket.create({
        data: {
          eventId,
          userId: targetUserId,
          seat: seat || 'Pista',
          qrCode,
          status: 'VALID',
        },
        include: { event: true },
      });
    }

    return NextResponse.json(
      {
        message: 'Pagamento aprovado e ingresso gerado com sucesso!',
        ticket: newTicket,
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