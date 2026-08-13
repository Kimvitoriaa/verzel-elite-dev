import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Listar todos os eventos com os dados do organizador
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar a lista de eventos.' },
      { status: 500 }
    );
  }
}

// POST: Criar um novo evento
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, date, location, bannerUrl, totalTickets, organizerId } = body;

    if (!title || !description || !date || !location || !totalTickets || !organizerId) {
      return NextResponse.json(
        { error: 'Título, descrição, data, local, total de ingressos e ID do organizador são obrigatórios.' },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        bannerUrl: bannerUrl || null,
        totalTickets: Number(totalTickets),
        organizerId,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno ao criar evento.' },
      { status: 500 }
    );
  }
}