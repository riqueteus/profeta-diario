import type { Noticia } from '../components/NewsScreen';

const GNEWS_API_URL = 'https://gnews.io/api/v4/search';
const GNEWS_API_TOKEN = process.env.EXPO_PUBLIC_GNEWS_API_KEY;

async function fetchByQueryPTBR(queryText: string, tema: string): Promise<Noticia[]> {
  if (!GNEWS_API_TOKEN) {
    return [];
  }

  const params = new URLSearchParams({
    q: queryText,
    lang: 'pt',
    country: 'br',
    max: '20',
    token: GNEWS_API_TOKEN,
    sortby: 'publishedAt',
  });

  const url = `${GNEWS_API_URL}?${params.toString()}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('[news] GNews HTTP error', res.status, await res.text());
      return [];
    }
    const data = await res.json();
    const artigos = Array.isArray(data?.articles) ? data.articles : [];
    return artigos.map((a: any) => ({
      titulo: a?.title ?? 'Sem título',
      descricao: a?.description ?? '',
      link: a?.url ?? '',
      urlDaImagem: a?.image ?? undefined,
      publicadoEm: a?.publishedAt ?? new Date().toISOString(),
      tema,
    }));
  } catch (e) {
    console.error('[news] GNews fetch error', e);
    return [];
  }
}

export function fetchEconomiaNewsPTBR(): Promise<Noticia[]> {
  return fetchByQueryPTBR('economia OR mercado OR juros OR inflação', 'Economia');
}

export async function fetchTecnologiaNewsPTBR(): Promise<Noticia[]> {
  return fetchByQueryPTBR('tecnologia OR IA OR inovação OR software', 'Tecnologia');
}

export async function fetchPoliticaNewsPTBR(): Promise<Noticia[]> {
  return fetchByQueryPTBR('política OR governo OR eleições', 'Política');
}

export async function fetchCulturaNewsPTBR(): Promise<Noticia[]> {
  return fetchByQueryPTBR('cultura OR arte OR cinema OR música OR teatro', 'Cultura');
}
