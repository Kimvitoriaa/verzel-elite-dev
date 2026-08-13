import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET() {
  try {
    if (!TMDB_API_KEY) {
      return NextResponse.json(
        { error: 'Chave de API do TMDb não configurada.' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao buscar dados do TMDb.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    const movies = data.results.map((movie: any) => ({
      tmdbId: String(movie.id),
      title: movie.title,
      description: movie.overview,
      releaseDate: movie.release_date,
      bannerUrl: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
    }));

    return NextResponse.json(movies, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno ao consultar TMDb.' },
      { status: 500 }
    );
  }
}