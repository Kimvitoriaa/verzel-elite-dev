'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  totalTickets: number;
}

export default function HomePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      try {
        setUsuario(JSON.parse(userStr));
      } catch {}
    }

    async function loadEvents() {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (err) {
        console.error('Erro ao buscar eventos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#09090b] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">
              🎟️ Verzel Elite Events
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Plataforma de eventos, ingressos e portaria integrada.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/organizador"
              className="bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-xs font-bold py-2.5 px-4 rounded-xl border border-indigo-700/50 transition"
            >
              👑 Painel Organizador
            </Link>

            <Link
              href="/ingressos"
              className="bg-zinc-800 hover:bg-zinc-700 text-xs font-bold py-2.5 px-4 rounded-xl border border-zinc-700 transition"
            >
              🎟️ Meus Ingressos
            </Link>

            <Link
              href="/portaria"
              className="bg-purple-600 hover:bg-purple-500 text-xs font-bold py-2.5 px-4 rounded-xl transition"
            >
              🚪 Portaria 2D
            </Link>

            {usuario ? (
              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-950 hover:bg-red-900 text-red-300 text-xs font-bold py-2.5 px-3 rounded-xl border border-red-800/60 transition"
              >
                Sair ({usuario.nome ? usuario.nome.split(' ')[0] : 'Conta'})
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-zinc-100 hover:bg-white text-black text-xs font-extrabold py-2.5 px-4 rounded-xl transition shadow-lg"
              >
                👤 Entrar
              </Link>
            )}
          </div>
        </header>

        <div className="mb-8">
          <input
            type="text"
            placeholder="🔍 Buscar evento pelo título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-purple-500 transition text-zinc-200"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-500 text-sm animate-pulse">
            Carregando catálogo...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 text-sm">
            Nenhum evento encontrado no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 flex flex-col justify-between transition"
              >
                <div>
                  <h2 className="text-lg font-bold text-zinc-100">{event.title}</h2>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-3">{event.description}</p>
                </div>

                <div className="mt-6 border-t border-zinc-800/80 pt-4 space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>📍 Local:</span>
                    <span className="text-zinc-200 font-medium">{event.location}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>📅 Data:</span>
                    <span className="text-zinc-200 font-medium">
                      {new Date(event.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <Link
                    href={`/eventos/${event.id}`}
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center transition"
                  >
                    Garantir Ingresso
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}