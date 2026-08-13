'use client';

import { useState } from 'react';

export default function PortariaPage() {
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCodeInput) return;

    setLoading(true);
    setStatus('IDLE');
    setMessage('');

    try {
      // Puxa um id fixo de staff para simulação da portaria
      const res = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode: qrCodeInput,
          validatorId: 'portaria-principal-id', 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('SUCCESS');
        setMessage(data.message || 'Entrada Liberada!');
      } else {
        setStatus('ERROR');
        setMessage(data.error || 'Ingresso Inválido!');
      }
    } catch (err) {
      setStatus('ERROR');
      setMessage('Erro ao conectar com o servidor da portaria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-purple-500 mb-2 text-center">
          🏛️ Controle de Portaria - Planta 2D
        </h1>
        <p className="text-zinc-400 text-sm text-center mb-8">
          Simulador de leitura e validação de ingressos na catraca de entrada.
        </p>

        {/* Planta 2D da Entrada */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Zona Externa */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-center flex flex-col justify-center items-center">
            <span className="text-2xl mb-2">👥</span>
            <h2 className="font-semibold text-zinc-300">Fila Externa</h2>
            <p className="text-xs text-zinc-500 mt-1">Aguardando Validação</p>
          </div>

          {/* Catraca Central (Interativa) */}
          <div
            className={`border-2 p-6 rounded-xl text-center transition-all duration-300 flex flex-col justify-center items-center ${
              status === 'SUCCESS'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/20'
                : status === 'ERROR'
                ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-500/20'
                : 'bg-zinc-900 border-purple-500/50'
            }`}
          >
            <span className="text-3xl mb-2">
              {status === 'SUCCESS' ? '🟢' : status === 'ERROR' ? '🔴' : '🚧'}
            </span>
            <h2 className="font-bold text-lg">Catraca Principal</h2>
            <p className="text-xs mt-1 font-mono">
              {status === 'SUCCESS'
                ? 'CATRACA LIBERADA'
                : status === 'ERROR'
                ? 'ACESSO NEGADO'
                : 'AGUARDANDO LEITURA'}
            </p>
          </div>

          {/* Zona Interna */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-center flex flex-col justify-center items-center">
            <span className="text-2xl mb-2">🎪</span>
            <h2 className="font-semibold text-zinc-300">Área do Evento</h2>
            <p className="text-xs text-zinc-500 mt-1">Público Confirmado</p>
          </div>
        </div>

        {/* Leitor de QR Code */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl max-w-lg mx-auto">
          <form onSubmit={handleValidate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Código do QR Code / Hash do Ingresso:
              </label>
              <input
                type="text"
                placeholder="Ex: TICKET-1a2b3c-4d5e6f-2026"
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? 'Validando...' : '🔍 Validar Entrada'}
            </button>
          </form>

          {/* Resultado da Validação */}
          {message && (
            <div
              className={`mt-4 p-3 rounded-lg text-xs font-semibold text-center ${
                status === 'SUCCESS'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}