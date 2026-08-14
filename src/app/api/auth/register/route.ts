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
    const role = (body.role || body.papel || 'CLIENTE').toUpperCase();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, e-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const client = prisma as any;

    // 1. Tenta criar pelo modelo 'user'
    if (client.user) {
      const existing = await client.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 400 });
      }

      const user = await client.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });

      return NextResponse.json(
        {
          message: 'Usuário cadastrado com sucesso!',
          usuario: { id: user.id, nome: user.name, email: user.email, papel: user.role },
        },
        { status: 201 }
      );
    }

    // 2. Fallback caso o modelo seja 'usuario'
    if (client.usuario) {
      const existing = await client.usuario.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 400 });
      }

      const user = await client.usuario.create({
        data: {
          nome: name,
          email,
          senha: hashedPassword,
          papel: role,
        },
      });

      return NextResponse.json(
        {
          message: 'Usuário cadastrado com sucesso!',
          usuario: { id: user.id, nome: user.nome, email: user.email, papel: user.papel },
        },
        { status: 201 }
      );
    }

    return NextResponse.json({ error: 'Modelo de usuário não configurado no Prisma.' }, { status: 500 });
  } catch (error: any) {
    console.error('Erro detalhado no registro:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro interno ao processar cadastro.' },
      { status: 500 }
    );
  }
}