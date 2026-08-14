'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('organizador@elite.com');
  const [senha, setSenha] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const perfisTeste = [
    { label: '👑 Organizador', email: 'organizador@elite.com', senha: '123456', redirect: '/organizador' },
    { label: '👤 Cliente 1', email: 'cliente1@elite.com', senha: '123456', redirect: '/' },
    { label: '👤 Cliente 2', email: 'cliente2@elite.com', senha: '123456', redirect: '/' },
    { label: '🚪 Portaria', email: 'portaria@elite.com', senha: '123456', redirect: '/portaria' },
  ];

  async function handleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Falha ao autenticar.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      if (data.usuario.papel === 'ORGANIZADOR') {
        router.push('/organizador');
      } else if (data.usuario.papel === 'PORTARIA') {
        router.push('/portaria');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setErro(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  }

  function preencherPerfil(perfil: typeof perfisTeste[0]) {
    setEmail(perfil.email);
    setSenha(perfil.senha);
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition">
            ← Voltar ao Catálogo
          </Link>
          <h1 className="text-3xl font-extrabold text-white mt-4">Acessar Plataforma</h1>
          <p className="text-xs text-zinc-400 mt-1">Entre para comprar ingressos ou gerenciar eventos</p>
        </div>

        <div className="mb-6">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
            ⚡ Acesso Rápido de Teste (Seed):
          </p>
          <div className="grid grid-cols-2 gap-2">
            {perfisTeste.map((p) => (
              <button
                type="button"
                key={p.email}
                onClick={() => preencherPerfil(p)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border text-left transition ${
                  email === p.email
                    ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                    : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-300">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300">Senha</label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full mt-1 bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {erro && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs">
              ⚠️ {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
          >
            {loading ? 'Autenticando...' : 'Entrar na Conta'}
          </button>
        </form>
      </div>
    </main>
  );
}