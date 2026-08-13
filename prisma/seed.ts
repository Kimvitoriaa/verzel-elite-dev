import { PrismaClient, TicketStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.ticket.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = '$2a$10$e8T/k32C8Vj0y8b3b7e4u.8X9y3b7e4u8X9y3b7e4u8X9y3b7e4u';

  // 1. Organizador
  const organizer = await prisma.user.create({
    data: {
      name: 'Rock World Organização',
      email: 'organizador@rockinrio.com',
      password: passwordHash,
    },
  });

  // 2. Clientes
  const client1 = await prisma.user.create({
    data: {
      name: 'Kimberlly Silva',
      email: 'cliente1@gmail.com',
      password: passwordHash,
    },
  });

  const client2 = await prisma.user.create({
    data: {
      name: 'Carlos Eduardo',
      email: 'cliente2@gmail.com',
      password: passwordHash,
    },
  });

  // 3. Usuário da Portaria
  const staff = await prisma.user.create({
    data: {
      name: 'Portaria Principal',
      email: 'portaria@rockinrio.com',
      password: passwordHash,
    },
  });

  // 4. Evento de Rock
  const event = await prisma.event.create({
    data: {
      title: 'Rock in Rio Elite - Palco Mundo',
      description: 'O maior festival de rock do planeta.',
      date: new Date('2026-09-18T20:00:00Z'),
      location: 'Cidade do Rock - Rio de Janeiro',
      totalTickets: 500,
      organizerId: organizer.id,
      bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
    },
  });

  // 5. Ingresso (Com o status AVAILABLE do seu Schema)
  await prisma.ticket.create({
    data: {
      eventId: event.id,
      userId: client1.id,
      qrCode: `TICKET-${event.id.slice(0, 6)}-${client1.id.slice(0, 6)}-2026`,
      status: TicketStatus.AVAILABLE,
    },
  });

  console.log('🌱 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });