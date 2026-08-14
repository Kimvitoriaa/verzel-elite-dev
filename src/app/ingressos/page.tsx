'use client';

import { useState } from 'react';

interface Ticket {
  id: string;
  eventName: string;
  date: string;
  location: string;
  qrCode: string;
}

export default function IngressosPage() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [pin, setPin] = useState('');
  const [is2FaVerified, setIs2FaVerified] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Exemplo de ingresso simulado
  const mockTicket: Ticket = {
    id: '1',
    eventName: 'Sessão de Cinema VIP - Elite',
    date: '15/08/2026 às 20:00',
    location: 'Cinema Sala 1 - BH',
    qrCode: 'TICKET-EVENT123-USER876-2026',
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
      setIs2FaVerified(true);
      setError('');
    } else {
      setError('PIN de segurança incorreto. Tente 1234.');
    }
  };

  const handleShareTicket = () => {
    const shareUrl = `${window.location.origin}/ingressos?code=${mockTicket.qrCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>🎟️ Meus Ingressos</h1>
      <p>Gerencie seus ingressos e visualize seus QR Codes de entrada.</p>

      <hr style={{ margin: '1.5rem 0' }} />

      {/* Cartão do Ingresso */}
      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '1.5rem',
          backgroundColor: '#1a1a1a',
          color: '#fff',
        }}
      >
        <h3>{mockTicket.eventName}</h3>
        <p><strong>Data:</strong> {mockTicket.date}</p>
        <p><strong>Local:</strong> {mockTicket.location}</p>

        {!selectedTicket ? (
          <button
            onClick={() => setSelectedTicket(mockTicket)}
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem',
            }}
          >
            Visualizar QR Code de Entrada
          </button>
        ) : (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #333' }}>
            {!is2FaVerified ? (
              <div>
                <h4>🔒 Autenticação de Segurança (2FA)</h4>
                <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
                  Digite seu PIN de 4 dígitos para liberar a exibição do QR Code (Use: <strong>1234</strong>).
                </p>
                <form onSubmit={handleVerify2FA} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="PIN"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #555',
                      width: '80px',
                      textAlign: 'center',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#22c55e',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Confirmar
                  </button>
                </form>
                {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>}
              </div>
            ) : (
              <div style={{ textAlign: 'center', background: '#fff', color: '#000', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ fontWeight: 'bold', color: '#16a34a' }}>✅ Entrada Liberada!</p>
                <div style={{ margin: '1rem 0', fontSize: '0.8rem', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  [ Imagem do QR Code ]<br />
                  {mockTicket.qrCode}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleShareTicket}
                    style={{
                      padding: '0.4rem 0.8rem',
                      backgroundColor: '#8b5cf6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {copied ? '🔗 Link Copiado!' : '🔗 Compartilhar Ingresso'}
                  </button>

                  <button
                    onClick={() => {
                      setIs2FaVerified(false);
                      setSelectedTicket(null);
                      setPin('');
                    }}
                    style={{
                      padding: '0.4rem 0.8rem',
                      backgroundColor: '#666',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Ocultar QR Code
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}