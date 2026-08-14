'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CatalogItem {
  id: number;
  title: string;
  overview: string;
  poster_path?: string;
}

export default function OrganizadorPage() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [totalTickets, setTotalTickets] = useState(100);
  const [publishing, setPublishing] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  useEffect(() => {
    // Validação de acesso restrito ao Organizador
    const userStr = localStorage.getItem('usuario');
    if (!userStr) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.papel !== 'ORGANIZADOR' && user.role !== 'ORGANIZADOR') {
        alert('Acesso restrito apenas para Organizadores.');
        router.push('/');
        return;
      }
      setAutorizado(true);
    } catch {
      router.push('/login');
      return;
    }

    async function loadCatalog() {
      setLoadingCatalog(true);
      try {
        const res = await fetch('/api/tmdb/movies');
        if (res.ok) {
          const data = await res.json();
          setCatalog(Array.isArray(data) ? data : data.results || []);
        }
      } catch (err) {
        console.error('Erro ao carregar catálogo:', err);
      } finally {
        setLoadingCatalog(false);
      }
    }
    loadCatalog();
  }, [router]);

  if (!autorizado) {
    return (
      <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <div className="text-zinc-400 text-sm animate-pulse">Verificando permissões de acesso...</div>
      </main>
    );
  }

  function handleSelect(item: CatalogItem) {
    setSelectedItem(item);
    setTitle(item.title);
    setDescription(item.overview);
    setFeedback(null);
  }

  async function handlePublishEvent(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setPublishing(true);

    try {
      const userStr = localStorage.getItem('usuario');
      const user = userStr ? JSON.parse(userStr) : null;

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          date: date ? new Date(date).toISOString() : new Date().toISOString(),
          location,
          totalTickets: Number(totalTickets),
          organizerId: user?.id,
          bannerUrl: selectedItem?.poster_path
            ? `https://image.tmdb.org/t/p/w500${selectedItem.poster_path}`
            : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao publicar evento.');
      }

      setFeedback({ tipo: 'sucesso', texto: 'Evento publicado com sucesso no catálogo!' });
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
      setSelectedItem(null);
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Falha ao salvar evento.' });
    } finally {
      setPublishing(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
          <div>
            <Link href="/" className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition">
              ← Voltar ao Início
            </Link>
            <h1 className="text-3xl font-extrabold text-white mt-2">Painel do Organizador</h1>
            <p className="text-xs text-zinc-400 mt-1">Criação e gerenciamento de eventos da plataforma</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-2">1. Selecionar Atração</h2>
            <p className="text-xs text-zinc-400 mb-4">Escolha uma atração disponível para preenchimento rápido.</p>

            {loadingCatalog ? (
              <div className="text-center py-12 text-zinc-500 text-xs animate-pulse">Carregando catálogo...</div>
            ) : catalog.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">Nenhuma atração disponível no momento.</div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
                {catalog.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-start justify-between gap-4 ${
                      selectedItem?.id === item.id
                        ? 'bg-purple-950/60 border-purple-500'
                        : 'bg-zinc-800/40 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <h3 className="text-xs font-bold text-white">{item.title}</h3>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">{item.overview || 'Sem descrição.'}</p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 text-[10px] bg-purple-600 hover:bg-purple-500 text-white font-bold py-1.5 px-3 rounded-lg"
                    >
                      Selecionar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-2">2. Detalhes do Evento</h2>
            <p className="text-xs text-zinc-400 mb-6">Defina data, local e capacidade de ingressos.</p>

            <form onSubmit={handlePublishEvent} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300">Título do Evento</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nome do evento"
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Descrição</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Sinopse ou descrição do evento..."
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-300">Data do Evento</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300">Capacidade de Ingressos</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    required
                    value={totalTickets}
                    onChange={(e) => setTotalTickets(Number(e.target.value))}
                    className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">Localização</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Local ou endereço"
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-xl text-xs border ${
                    feedback.tipo === 'sucesso'
                      ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                      : 'bg-red-950 border-red-800 text-red-300'
                  }`}
                >
                  {feedback.texto}
                </div>
              )}

              <button
                type="submit"
                disabled={publishing}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-purple-600/30 mt-4"
              >
                {publishing ? 'Publicando Evento...' : 'Publicar Evento'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}