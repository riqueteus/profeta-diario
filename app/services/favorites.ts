import { collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import type { Noticia } from '../components/NewsScreen';
import { getFirebaseDb } from './firebase';

function construirIdFavorito(n: Noticia): string {
  // Usa link se existir, senão usa título; normaliza para ID simples
  const base = (n.link && n.link.length > 0 ? n.link : n.titulo).toLowerCase();
  return encodeURIComponent(base).slice(0, 512);
}

export async function salvarFavorito(uid: string, userEmail: string | null, noticia: Noticia): Promise<void> {
  const db = getFirebaseDb();
  const favId = construirIdFavorito(noticia);
  const ref = doc(db, 'users', uid, 'favorites', favId);
  await setDoc(
    ref,
    {
      titulo: noticia.titulo,
      descricao: noticia.descricao ?? '',
      link: noticia.link ?? '',
      urlDaImagem: noticia.urlDaImagem ?? '',
      publicadoEm: noticia.publicadoEm ?? new Date().toISOString(),
      tema: noticia.tema ?? 'Outros',
      userEmail: userEmail ?? '',
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function removerFavorito(uid: string, noticia: Noticia): Promise<void> {
  const db = getFirebaseDb();
  const favId = construirIdFavorito(noticia);
  const ref = doc(db, 'users', uid, 'favorites', favId);
  await deleteDoc(ref);
}

export async function listarFavoritos(uid: string): Promise<Noticia[]> {
  const db = getFirebaseDb();
  const ref = collection(db, 'users', uid, 'favorites');
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as any;
    const titulo = data?.titulo;
    const descricao = data?.descricao;
    const link = data?.link;
    const urlDaImagem = data?.urlDaImagem;
    const publicadoEm = typeof data?.publicadoEm === 'string'
      ? data.publicadoEm
      : (typeof data?.publishedAt === 'string' ? data.publishedAt : new Date().toISOString());
    return {
      titulo,
      descricao,
      link,
      urlDaImagem,
      publicadoEm,
      tema: data?.tema ?? 'Outros',
    } as Noticia;
  });
}


