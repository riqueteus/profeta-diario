import { makeRedirectUri } from 'expo-auth-session';
import type { GoogleAuthRequestConfig } from 'expo-auth-session/providers/google';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  GoogleAuthProvider,
  type User,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithCredential,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getFirebaseApp, getFirebaseAuth, getFirebaseDb } from '../services/firebase';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextValue {
  user: User | null;
  inicializando: boolean;
  carregando: boolean;
  erro: string | null;
  entrarComGoogle: () => Promise<void>;
  sairDaConta: () => Promise<void>;
}
const ContextoDeAutenticacao = createContext<AuthContextValue | undefined>(undefined);

function useConfiguracaoGoogle(): GoogleAuthRequestConfig | null {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID ?? process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  if (!clientId) {
    return null;
  }

  const redirectUri = makeRedirectUri({ useProxy: true } as any);

  return {
    clientId,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
    redirectUri,
    responseType: 'id_token',
  } satisfies GoogleAuthRequestConfig;
}

export const ProvedorDeAutenticacao: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const app = useMemo(() => getFirebaseApp(), []);
  const auth = useMemo(() => getFirebaseAuth(), [app]);
  const db = useMemo(() => getFirebaseDb(), [app]);

  const [user, setUser] = useState<User | null>(null);
  const [inicializando, setInicializando] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const configRequisicaoGoogle = useConfiguracaoGoogle();

  const [request, , dispararAutenticacao] = Google.useAuthRequest(configRequisicaoGoogle ?? undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setInicializando(false);

      if (firebaseUser) {
        try {
          await setDoc(
            doc(db, 'users', firebaseUser.uid),
            {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              lastLoginAt: serverTimestamp(),
              providerId: firebaseUser.providerData[0]?.providerId ?? 'unknown',
            },
            { merge: true }
          );
        } catch (firestoreError) {
          console.error('[Auth] Firestore persist error', firestoreError);
        }
      }
    });

    return unsubscribe;
  }, [auth, db]);

  const entrarComGoogle = useCallback(async () => {
    if (!configRequisicaoGoogle || !request) {
      console.error('[Auth] signInWithGoogle: missing googleRequestConfig or request', {
        hasConfig: Boolean(configRequisicaoGoogle),
        hasRequest: Boolean(request),
      });
      throw new Error(
        'Configuração do Google não encontrada. Verifique as variáveis de ambiente e reinicie o app.'
      );
    }

    setCarregando(true);
    setErro(null);

    try {
      const result = (await dispararAutenticacao({
        showInRecents: true,
        useProxy: true,
      } as any)) as any;

      const idTokenFromAuth = result?.authentication?.idToken as string | undefined;
      const accessTokenFromAuth = result?.authentication?.accessToken as string | undefined;
      const idTokenFromParams = (result as any)?.params?.id_token as string | undefined;

      const effectiveIdToken = idTokenFromAuth ?? idTokenFromParams;
      const effectiveAccessToken = accessTokenFromAuth; 

      if (result.type !== 'success' || !effectiveIdToken) {
        if (result.type !== 'cancel') {
          console.error('[Auth] signInWithGoogle: missing success or idToken', result);
          throw new Error('Não foi possível completar o login com Google.');
        }
        return;
      }

      const credential = GoogleAuthProvider.credential(effectiveIdToken, effectiveAccessToken);
      await signInWithCredential(auth, credential);
    } catch (authError) {
      console.error('[Auth] Login error', authError);
      const message =
        authError instanceof Error ? authError.message : 'Erro inesperado ao entrar com Google.';
      setErro(message);
      throw authError;
    } finally {
      setCarregando(false);
    }
  }, [auth, configRequisicaoGoogle, dispararAutenticacao, request]);

  const sairDaConta = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      await firebaseSignOut(auth);
    } catch (authError) {
      const message =
        authError instanceof Error ? authError.message : 'Erro inesperado ao sair da conta.';
      setErro(message);
      throw authError;
    } finally {
      setCarregando(false);
    }
  }, [auth]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, inicializando, carregando, erro, entrarComGoogle, sairDaConta }),
    [erro, inicializando, carregando, entrarComGoogle, sairDaConta, user]
  );

  return <ContextoDeAutenticacao.Provider value={value}>{children}</ContextoDeAutenticacao.Provider>;
};

export const useAutenticacao = (): AuthContextValue => {
  const context = useContext(ContextoDeAutenticacao);
  if (!context) {
    throw new Error('useAutenticacao deve ser utilizado dentro de um ProvedorDeAutenticacao.');
  }
  return context;
};
