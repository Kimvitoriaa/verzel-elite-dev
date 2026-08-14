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
    const rawRole = (body.role || body.papel || 'CLIENTE').toUpperCase();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, e-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const client = prisma as any;

    // Mapeamento dinâmico para garantir compatibilidade com o Enum Role do Prisma
    let roleToSave = rawRole;
    if (rawRole === 'ORGANIZADOR' || rawRole === 'ORGANIZER') {
      roleToSave = 'ORGANIZER';
    } else if (rawRole === 'PORTARIA' || rawRole === 'DOORMAN' || rawRole === 'STAFF') {
      roleToSave = 'DOORMAN';
    } else {
      roleToSave = 'CUSTOMER';
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Tenta gravar adaptando para o Enum correspondente
    let newUser = null;
    const rolesToTry = [roleToSave, rawRole, 'CLIENT', 'CUSTOMER', 'USER', 'ORGANIZER', 'ORGANIZADOR'];

    for (const r of rolesToTry) {
      try {
        if (client.user) {
          newUser = await client.user.create({
            data: {
              name,
              email,
              password: hashedPassword,
              role: r,
            },
          });
          break;
        } else if (client.usuario) {
          newUser = await client.usuario.create({
            data: {
              nome: name,
              email,
              senha: hashedPassword,
              papel: r,
            },
          });
          break;
        }
      } catch (err: any) {
        if (err?.code === 'P2002') {
          return NextResponse.json(
            { error: 'Este e-mail já está cadastrado no sistema.' },
            { status: 400 }
          );
        }
        // Continua a tentativa com o próximo formato de enum
      }
    }

    if (!newUser) {
      return NextResponse.json(
        { error: 'Não foi possível cadastrar o usuário no banco de dados.' },
        { status: 500 }
      );
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
  } catch (error: any) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro interno ao processar cadastro.' },
      { status: 500 }
    );
  }
}