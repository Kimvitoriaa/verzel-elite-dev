'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EventDetailPage() {
  const router = useRouter();
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'SUCCESS' | 'REFUSED'>('IDLE');

  // Assentos simulados para cinema/teatro
  const seats = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'];

  const handleSimulatePayment = async (status: 'SUCCESS' | 'REFUSED') => {
    setLoading(true);
    setPaymentStatus('IDLE');

    // Simulação de delay de rede
    setTimeout(async () => {
      setLoading(false);
      setPaymentStatus(status);

      if (status === 'SUCCESS') {
        try {
          // Faz a requisição simulada para criar a compra
          await fetch('/api/tickets/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventId: 'event-12345678',
              quantity: ticketQuantity,
              seat: selectedSeat || 'Pista Livre',
            }),
          });
        } catch (e) {
          console.error(e);
        }
      }
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-10 shadow-2xl">
        <Link
          href="/"
          className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1 mb-6"
        >
          ← Voltar para o Catálogo
        </Link>

        <h1 className="text-3xl font-extrabold text-zinc-100 mb-2">
          🎟️ Sessão VIP - Cinema & Show Elite
        </h1>
        <p className="text-sm text-zinc-400 mb-6">
          Selecione seus assentos ou quantidade de ingressos e simule o checkout de pagamento.
        </p>

        <hr className="border-zinc-800 mb-8" />

        {/* Seleção de Assentos (Mapa Simulado) */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">
            💺 Escolha seu Assento (Opcional):
          </h3>
          <div className="grid grid-cols-4 gap-3 max-w-xs">
            {seats.map((seat) => (
              <button
                key={seat}
                onClick={() => setSelectedSeat(seat === selectedSeat ? null : seat)}
                className={`py-2 rounded-xl text-xs font-mono font-bold transition border ${
                  selectedSeat === seat
                    ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {seat}
              </button>
            ))}
          </div>
          {selectedSeat && (
            <p className="text-xs text-purple-400 mt-2">
              Assento Selecionado: <strong>{selectedSeat}</strong>
            </p>
          )}
        </div>

        {/* Quantidade de Ingressos */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">
            🎟️ Quantidade de Ingressos (Pista/Geral):
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
              className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-lg font-bold transition"
            >
              -
            </button>
            <span className="text-lg font-bold font-mono">{ticketQuantity}</span>
            <button
              onClick={() => setTicketQuantity(ticketQuantity + 1)}
              className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-lg font-bold transition"
            >
              +
            </button>
          </div>
        </div>

        {/* Checkout de Pagamento Simulado */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-zinc-200 mb-2">
            💳 Simulação de Pagamento
          </h3>
          <p className="text-xs text-zinc-400 mb-6">
            Teste os dois fluxos de cobrança exigidos pelo desafio (Aprovado e Recusado)[cite: 3].
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              disabled={loading}
              onClick={() => handleSimulatePayment('SUCCESS')}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold py-3 rounded-xl transition"
            >
              {loading ? 'Processando...' : '✅ Simular Pagamento APROVADO'}
            </button>

            <button
              disabled={loading}
              onClick={() => handleSimulatePayment('REFUSED')}
              className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold py-3 rounded-xl transition"
            >
              {loading ? 'Processando...' : '❌ Simular Pagamento RECUSADO'}
            </button>
          </div>

          {/* Feedbacks de Pagamento */}
          {paymentStatus === 'SUCCESS' && (
            <div className="mt-6 bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-4 rounded-xl text-xs space-y-2">
              <p className="font-bold">🎉 Compra Aprovada com Sucesso!</p>
              <p>Seu ingresso já foi gerado e enviado para a sua carteira.</p>
              <button
                onClick={() => router.push('/ingressos')}
                className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg transition"
              >
                Ir para "Meus Ingressos" →
              </button>
            </div>
          )}

          {paymentStatus === 'REFUSED' && (
            <div className="mt-6 bg-rose-950/60 border border-rose-800 text-rose-300 p-4 rounded-xl text-xs">
              <p className="font-bold">⚠️ Pagamento Recusado pela Operadora!</p>
              <p className="mt-1 text-rose-400">
                Cartão de teste simulou saldo insuficiente ou transação negada. Tente novamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}