export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = body.name || body.nome;
    const email = body.email;
    const password = body.password || body.senha;
    const role = body.role || body.papel || 'CLIENTE';

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, e-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const client = prisma as any;

    // Verifica se já existe usuário com esse e-mail
    const existingUser = client.user
      ? await client.user.findUnique({ where: { email } })
      : await client.usuario?.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este e-mail já está cadastrado.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;
    if (client.user) {
      newUser = await client.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });
    } else {
      newUser = await client.usuario.create({
        data: {
          nome: name,
          email,
          senha: hashedPassword,
          papel: role,
        },
      });
    }

    return NextResponse.json(
      {
        message: 'Usuário cadastrado com sucesso!',
        usuario: {
          id: newUser.id,
          nome: newUser.name || newUser.nome,
          email: newUser.email,
          papel: newUser.role || newUser.papel,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar cadastro no banco de dados.' },
      { status: 500 }
    );
  }
}