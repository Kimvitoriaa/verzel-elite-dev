export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const qrCode = (body.qrCode || body.code || '').trim();

    if (!qrCode) {
      return NextResponse.json(
        { error: 'Código do ingresso não informado.' },
        { status: 400 }
      );
    }

    const client = prisma as any;

    if (!client.ticket) {
      return NextResponse.json(
        { error: 'Serviço de ingressos indisponível.' },
        { status: 500 }
      );
    }

    // Busca o ingresso pelo hash/código QR
    const ticket = await client.ticket.findUnique({
      where: { qrCode },
      include: {
        event: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ingresso não encontrado ou inválido.' },
        { status: 404 }
      );
    }

    if (ticket.status === 'USED' || ticket.status === 'UTILIZADO') {
      return NextResponse.json(
        { error: 'Acesso negado: Este ingresso já foi utilizado.' },
        { status: 400 }
      );
    }

    if (ticket.status === 'CANCELLED' || ticket.status === 'CANCELADO') {
      return NextResponse.json(
        { error: 'Acesso negado: Este ingresso foi cancelado.' },
        { status: 400 }
      );
    }

    // Marca como utilizado na portaria para evitar revalidação
    const updated = await client.ticket.update({
      where: { id: ticket.id },
      data: { status: 'USED' },
      include: { event: true },
    });

    return NextResponse.json({
      message: 'Entrada liberada! Ingresso validado com sucesso.',
      ticket: {
        id: updated.id,
        seat: updated.seat,
        eventTitle: updated.event?.title,
        status: updated.status,
      },
    });
  } catch (error: any) {
    console.error('Erro na validação da portaria:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro interno ao validar ingresso.' },
      { status: 500 }
    );
  }
}