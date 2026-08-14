export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email;
    const senha = body.senha || body.password;

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    // Busca o usuário pelo e-mail
    const client = prisma as any;
    const usuario =
      (await client.usuario?.findUnique({ where: { email } })) ||
      (await client.user?.findUnique({ where: { email } }));

    if (!usuario) {
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 }
      );
    }

    const hashSenha = usuario.senha || usuario.password;
    const senhaValida = await bcrypt.compare(senha, hashSenha);

    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET || 'verzel_elite_dev_secret_key_2026';
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        papel: usuario.papel || usuario.role,
      },
      secret,
      { expiresIn: '1d' }
    );

    return NextResponse.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome || usuario.name,
        email: usuario.email,
        papel: usuario.papel || usuario.role,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar login.' },
      { status: 500 }
    );
  }
}