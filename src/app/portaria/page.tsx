'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PortariaContent() {
  const searchParams = useSearchParams();
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState('');
  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setQrCodeInput(codeFromUrl);
    }
  }, [searchParams]);

  async function handleValidate(e: React.FormEvent) {
    e.preventDefault();
    if (!qrCodeInput.trim()) return;

    setLoading(true);
    setStatus('IDLE');
    setMessage('');
    setTicketData(null);

    try {
      const res = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: qrCodeInput.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('SUCCESS');
        setMessage(data.message || 'Entrada Liberada!');
        setTicketData(data.ticket);
      } else {
        setStatus('ERROR');
        setMessage(data.error || 'Ingresso Inválido ou Já Utilizado!');
      }
    } catch (err) {
      setStatus('ERROR');
      setMessage('Falha na conexão com a central de validação.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
          <div>
            <Link href="/" className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition">
              ← Voltar ao Catálogo
            </Link>
            <h1 className="text-3xl font-extrabold text-white mt-2">🏛️ Controle de Portaria - Validação</h1>
            <p className="text-xs text-zinc-400 mt-1">Validação em tempo real na catraca de entrada</p>
          </div>
        </div>

        {/* Indicadores Visuais de Catraca */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 text-center">
            <div className="text-2xl mb-1">👥</div>
            <div className="text-xs font-bold text-zinc-300">Fila Externa</div>
            <div className="text-[11px] text-zinc-500 mt-1">Aguardando Validação</div>
          </div>

          <div
            className={`rounded-2xl p-5 text-center border transition-all ${
              status === 'SUCCESS'
                ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-500/20'
                : status === 'ERROR'
                ? 'bg-red-950/60 border-red-500 shadow-lg shadow-red-500/20'
                : 'bg-zinc-900 border-purple-500/50'
            }`}
          >
            <div className="text-2xl mb-1">
              {status === 'SUCCESS' ? '🟢' : status === 'ERROR' ? '🔴' : '🚧'}
            </div>
            <div className="text-xs font-bold text-white">Catraca Principal</div>
            <div className="text-[11px] text-zinc-400 mt-1">
              {status === 'SUCCESS'
                ? 'ACESSO LIBERADO'
                : status === 'ERROR'
                ? 'ACESSO NEGADO'
                : 'AGUARDANDO LEITURA'}
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 text-center">
            <div className="text-2xl mb-1">🎪</div>
            <div className="text-xs font-bold text-zinc-300">Área do Evento</div>
            <div className="text-[11px] text-zinc-500 mt-1">Público Confirmado</div>
          </div>
        </div>

        {/* Formulário de Leitura / Digitação Manual */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleValidate} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-300">Código do QR Code / Hash do Ingresso:</label>
              <input
                type="text"
                required
                placeholder="Ex: TICKET-AB12CD-2026"
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                className="w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-bold py-3.5 rounded-xl text-xs transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              {loading ? 'Validando na Base...' : '🔍 Validar Entrada'}
            </button>
          </form>

          {/* Retorno da Validação */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-2xl border text-xs font-semibold flex flex-col gap-1 ${
                status === 'SUCCESS'
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                  : 'bg-red-950/80 border-red-800 text-red-300'
              }`}
            >
              <div className="flex items-center gap-2 text-sm">
                <span>{status === 'SUCCESS' ? '✓' : '⚠️'}</span>
                <span>{message}</span>
              </div>
              {ticketData && (
                <div className="mt-2 pt-2 border-t border-emerald-800/60 text-[11px] text-emerald-200">
                  <div>🎟️ <strong>Evento:</strong> {ticketData.eventTitle}</div>
                  <div>💺 <strong>Assento:</strong> {ticketData.seat}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function PortariaPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-zinc-500">Carregando portaria...</div>}>
      <PortariaContent />
    </Suspense>
  );
}