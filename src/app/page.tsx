'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  totalTickets: number;
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header / Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              🎟️ Verzel Elite Events
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Explore o catálogo completo de shows e filmes em cartaz.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/ingressos"
              className="bg-zinc-800 hover:bg-zinc-700 text-xs px-4 py-2.5 rounded-lg font-medium transition"
            >
              🎟️ Meus Ingressos
            </Link>
            <Link
              href="/portaria"
              className="bg-purple-600 hover:bg-purple-500 text-xs px-4 py-2.5 rounded-lg font-semibold transition"
            >
              🏛️ Portaria 2D
            </Link>
          </div>
        </div>

        {/* Campo de Busca */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="🔍 Pesquisar evento por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        {/* Listagem de Eventos */}
        {loading ? (
          <div className="text-center py-20 text-zinc-500 text-sm">
            Carregando eventos do catálogo...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center text-zinc-400">
            Nenhum evento encontrado para "{search}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 rounded-2xl p-6 flex flex-col justify-between transition group shadow-lg"
              >
                <div>
                  <span className="text-[10px] font-mono uppercase bg-purple-950 text-purple-300 px-2.5 py-1 rounded-full border border-purple-800/40">
                    Disponível
                  </span>
                  <h2 className="text-xl font-bold mt-3 text-zinc-100 group-hover:text-purple-400 transition">
                    {event.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-3">
                    {event.description}
                  </p>
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