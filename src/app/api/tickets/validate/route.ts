import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { qrCode, validatorId } = await request.json();

    if (!qrCode || !validatorId) {
      return NextResponse.json(
        { error: 'QR Code e ID do validador são obrigatórios.' },
        { status: 400 }
      );
    }

    // Buscar o ingresso pelo hash do QR Code
    const ticket = await prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        event: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ingresso inválido ou não encontrado.' },
        { status: 404 }
      );
    }

    // Verificar se já foi utilizado
    if (ticket.status === 'USED') {
      return NextResponse.json(
        { error: 'ATENÇÃO: Ingresso já utilizado anteriormente!' },
        { status: 400 }
      );
    }

    // Registrar a validação na tabela Validation e atualizar o status do Ticket
    const validation = await prisma.validation.create({
      data: {
        ticketId: ticket.id,
        validatorId,
      },
    });

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'USED' },
    });

    return NextResponse.json(
      {
        message: 'Ingresso validado com sucesso! Entrada liberada.',
        ticket,
        validation,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno ao validar ingresso.' },
      { status: 500 }
    );
  }
}