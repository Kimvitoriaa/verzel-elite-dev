'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface EventDetails {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  totalTickets: number;
  bannerUrl?: string;
  price?: number;
}

export default function EventCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<string | null>('A1');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');
  const [cardSimulationState, setCardSimulationState] = useState<'success' | 'refused'>('success');
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const TICKET_PRICE = 80.0; // Preço padrão para cálculo

  const seats = [
    ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
    ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'],
    ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
  ];

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const events: EventDetails[] = await res.json();
          const found = events.find((e) => e.id === eventId);
          if (found) setEvent(found);
        }
      } catch (err) {
        console.error('Erro ao buscar detalhes do evento:', err);
      } finally {
        setLoading(false);
      }
    }
    if (eventId) fetchEvent();
  }, [eventId]);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setProcessing(true);

    // Simulação do tempo de resposta da adquirente/gateway
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (paymentMethod === 'credit_card' && cardSimulationState === 'refused') {
      setProcessing(false);
      setErrorMessage('Pagamento recusado pela operadora do cartão. (Motivo: Saldo insuficiente / Transação não autorizada).');
      return;
    }

    try {
      const res = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          seat: selectedSeat,
          quantity,
          amount: TICKET_PRICE * quantity,
          paymentMethod,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao processar reserva do ingresso.');
      }

      // Redireciona com sucesso para a tela de ingressos
      router.push('/ingressos?status=success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha na comunicação com o servidor.');
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-zinc-400 text-sm animate-pulse">Carregando detalhes do evento...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 mb-6 transition"
        >
          ← Voltar para o Catálogo
        </Link>

        {/* Header do Evento */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-6 mb-8 backdrop-blur">
          <span className="text-[10px] font-bold tracking-wider uppercase bg-purple-950/80 text-purple-400 border border-purple-800/50 px-3 py-1 rounded-full">
            Reserva & Checkout
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-3">
            {event?.title || 'Evento Selecionado'}
          </h1>
          <p className="text-zinc-400 text-sm mt-2">{event?.description}</p>
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-zinc-800/60 text-xs text-zinc-300">
            <div>📍 <strong className="text-zinc-100">Local:</strong> {event?.location || 'A definir'}</div>
            <div>📅 <strong className="text-zinc-100">Data:</strong> {event?.date ? new Date(event.date).toLocaleDateString('pt-BR') : 'A definir'}</div>
            <div>🎟️ <strong className="text-zinc-100">Preço unitário:</strong> R$ {TICKET_PRICE.toFixed(2)}</div>
          </div>
        </div>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna da Esquerda: Assentos e Quantidade */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mapa de Assentos */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                💺 Escolha seu Assento (Mapa de Cinema/Teatro)
              </h2>
              <p className="text-xs text-zinc-400 mb-4">Selecione uma poltrona disponível para este evento.</p>

              <div className="w-full bg-zinc-800/40 text-center text-[10px] text-zinc-500 font-bold py-1.5 rounded-lg mb-6 tracking-widest uppercase border border-zinc-800">
                TELA / PALCO
              </div>

              <div className="space-y-3">
                {seats.map((row, rIdx) => (
                  <div key={rIdx} className="flex justify-center gap-2">
                    {row.map((seat) => {
                      const isSelected = selectedSeat === seat;
                      return (
                        <button
                          type="button"
                          key={seat}
                          onClick={() => setSelectedSeat(seat)}
                          className={`w-10 h-10 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105 border border-purple-400'
                              : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/60'
                          }`}
                        >
                          {seat}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-xs text-purple-400 font-medium">
                Assento selecionado: <strong className="text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">{selectedSeat}</strong>
              </div>
            </div>

            {/* Ingressos Pista */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Quantidade de Ingressos (Pista)</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Selecione o total de entradas para a sua compra.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold border border-zinc-700 transition"
                >
                  -
                </button>
                <span className="w-6 text-center font-bold text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(6, q + 1))}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold border border-zinc-700 transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Pagamento e Checkout */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white mb-4">💳 Pagamento Simulado</h2>

              {/* Seletor de Método */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    paymentMethod === 'credit_card'
                      ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                      : 'bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  Cartão de Crédito
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    paymentMethod === 'pix'
                      ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                      : 'bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  Pix Instantâneo
                </button>
              </div>

              {/* Detalhes do Cartão Simulado */}
              {paymentMethod === 'credit_card' ? (
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-[11px] text-zinc-400 font-medium">Cenário de Teste da Transação:</label>
                    <select
                      value={cardSimulationState}
                      onChange={(e) => setCardSimulationState(e.target.value as any)}
                      className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 transition"
                    >
                      <option value="success">🟢 Cartão Válido (Aprovar Pagamento)</option>
                      <option value="refused">🔴 Cartão Sem Saldo (Simular Recusa)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 font-medium">Número do Cartão:</label>
                    <input
                      type="text"
                      disabled
                      value="•••• •••• •••• 4242"
                      className="w-full mt-1 bg-zinc-800/50 border border-zinc-700/60 rounded-xl px-3 py-2 text-xs font-mono text-zinc-400"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-zinc-800/40 rounded-xl border border-zinc-800 text-center mb-4">
                  <p className="text-xs text-zinc-300">O QR Code Pix de teste será gerado e compensado automaticamente após a confirmação.</p>
                </div>
              )}

              {/* Mensagem de Erro em caso de Recusa */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Resumo Financeiro */}
              <div className="border-t border-zinc-800 pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Ingressos ({quantity}x):</span>
                  <span>R$ {(TICKET_PRICE * quantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Taxa de conveniência:</span>
                  <span className="text-emerald-400">Grátis</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Total a Pagar:</span>
                  <span className="text-purple-400">R$ {(TICKET_PRICE * quantity).toFixed(2)}</span>
                </div>
              </div>

              {/* Botão Final de Checkout */}
              <button
                type="submit"
                disabled={processing}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
              >
                {processing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processando Transação...
                  </>
                ) : (
                  '🔒 Confirmar e Gerar Ingresso'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}