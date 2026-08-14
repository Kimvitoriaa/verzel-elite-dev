'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Ticket {
  id: string;
  qrCode: string;
  seat?: string;
  event: {
    title: string;
    date: string;
    location: string;
  };
}

export default function MeusIngressosPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTickets() {
      try {
        const userStr = localStorage.getItem('usuario');
        const user = userStr ? JSON.parse(userStr) : null;
        const url = user?.id ? `/api/tickets/purchase?userId=${user.id}` : '/api/tickets/purchase';

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setTickets(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Erro ao carregar ingressos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, []);

  function handleShare(qrCode: string, id: string) {
    const shareUrl = `${window.location.origin}/ingressos?code=${qrCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
          <div>
            <Link href="/" className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition">
              ← Voltar ao Catálogo
            </Link>
            <h1 className="text-3xl font-extrabold text-white mt-2">Meus Ingressos</h1>
            <p className="text-xs text-zinc-400 mt-1">Apresente seu QR Code na portaria para validação</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-zinc-500 text-xs animate-pulse">Carregando ingressos...</div>
        ) : tickets.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-400">
            <p className="text-base font-semibold text-white mb-1">Nenhum ingresso encontrado</p>
            <p className="text-xs text-zinc-400 mb-6">Você ainda não adquiriu nenhum ingresso para os eventos disponíveis.</p>
            <Link
              href="/"
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-2.5 py-1 rounded-full">
                      Confirmado
                    </span>
                    <span className="text-xs font-mono text-zinc-400">Assento: <strong className="text-white">{t.seat || 'Geral'}</strong></span>
                  </div>

                  <h2 className="text-lg font-bold text-white">{t.event?.title || 'Evento'}</h2>
                  <p className="text-xs text-zinc-400 mt-1">📍 {t.event?.location || 'Local'}</p>
                  <p className="text-xs text-zinc-400">
                    📅 {t.event?.date ? new Date(t.event.date).toLocaleDateString('pt-BR') : ''}
                  </p>
                </div>

                <div className="my-6 flex flex-col items-center justify-center p-4 bg-white rounded-2xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(t.qrCode)}`}
                    alt="QR Code do Ingresso"
                    className="w-40 h-40"
                  />
                  <span className="mt-3 text-[11px] font-mono font-bold text-zinc-800 tracking-wider">
                    {t.qrCode}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleShare(t.qrCode, t.id)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold py-2.5 rounded-xl border border-zinc-700 transition flex items-center justify-center gap-2"
                >
                  {copiedId === t.id ? '✓ Link copiado!' : '🔗 Compartilhar Link do Ingresso'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}