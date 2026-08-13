import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId, eventId } = await request.json();

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: 'ID do usuário e ID do evento são obrigatórios.' },
        { status: 400 }
      );
    }

    // Verificar se o evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado.' },
        { status: 404 }
      );
    }

    // Gerar um código único para o ingresso
    const ticketHash = `TICKET-${eventId.slice(0, 8)}-${userId.slice(0, 8)}-${Date.now()}`;

    // Gerar a imagem DataURL do QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(ticketHash);

    // Criar o ingresso no banco
    const ticket = await prisma.ticket.create({
      data: {
        qrCode: ticketHash,
        userId,
        eventId,
      },
      include: {
        event: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Ingresso gerado com sucesso!',
        ticket,
        qrCodeImage: qrCodeDataUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno ao gerar ingresso.' },
      { status: 500 }
    );
  }
}