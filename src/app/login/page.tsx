'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [papel, setPapel] = useState('CLIENTE');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      if (isRegister) {
        // Fluxo de Cadastro
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, email, senha, papel }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao realizar cadastro.');
        setIsRegister(false);
        setLoading(false);
        return;
      }

      // Fluxo de Login
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciais inválidas.');

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
      setErro(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <Link href="/" className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition">
            ← Voltar ao Catálogo
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">
            {isRegister ? 'Criar Nova Conta' : 'Acessar Conta'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {isRegister
              ? 'Preencha seus dados para se cadastrar'
              : 'Entre com suas credenciais para continuar'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="text-xs font-medium text-zinc-300">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Tipo de Perfil</label>
                <select
                  value={papel}
                  onChange={(e) => setPapel(e.target.value)}
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                >
                  <option value="CLIENTE">Cliente (Comprador de Ingressos)</option>
                  <option value="ORGANIZADOR">Organizador de Eventos</option>
                  <option value="PORTARIA">Controle de Portaria</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-medium text-zinc-300">E-mail</label>
            <input
              type="email"
              required
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300">Senha</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
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
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-purple-600/30"
          >
            {loading ? 'Aguarde...' : isRegister ? 'Finalizar Cadastro' : 'Entrar'}
          </button>
        </form>

        <div className="text-center mt-6 border-t border-zinc-800 pt-4">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErro(null);
            }}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium"
          >
            {isRegister ? 'Já possui conta? Faça login' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </main>
  );
}