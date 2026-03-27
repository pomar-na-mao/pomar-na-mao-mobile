import { authRepository } from '@/data/repositories/auth-repository';
import messages from '@/shared/constants/messages';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { Session, User } from '@supabase/supabase-js';
import * as Network from 'expo-network';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);

  const { setMessage, setIsVisible } = useAlertBoxStore();
  const { setIsLoading } = useLoadingStore();

  useEffect(() => {
    const checkNetworkAndSession = async () => {
      setIsLoading(true);

      const networkState = await Network.getNetworkStateAsync();
      const isConnected = networkState.isConnected ?? false;

      const session = await authRepository.getSession();

      if (session) {
        if (!isConnected) {
          // User is offline - sign out
          await authRepository.signOut();
          setSession(null);
          router.replace('/(auth)/login');
        } else {
          setSession(session);
          router.replace('/(tabs)');
        }
      } else {
        router.replace('/(auth)/login');
      }
      setIsLoading(false);
    };

    checkNetworkAndSession();

    const { data: subscription } = authRepository.onAuthStateChange((newSession) => {
      setSession(newSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    setIsLoading(true);
    const { error } = await authRepository.signIn(email, password);

    if (error) {
      const message = messages[error?.status as number] as string;

      setMessage(message);
      setIsVisible(true);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      router.replace('/(tabs)');
    }
  }

  async function resetPassword(email: string) {
    setIsLoading(true);
    const { error } = await authRepository.resetPassword(email);

    if (error) {
      const message = messages[error.status as number] as string;
      setMessage(message);
      setIsVisible(true);
    } else {
      setMessage('Acesse o link enviado para o seu email e gere uma nova senha!');
      setIsVisible(true);
      setIsLoading(false);
    }
  }

  async function signOut() {
    setIsLoading(true);
    const { error } = await authRepository.signOut();

    if (error) {
      const message = messages[error.status as number] as string;
      setMessage(message);
      setIsVisible(true);
    }

    setIsLoading(false);
    router.replace('/(auth)/login');
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
        signIn,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
