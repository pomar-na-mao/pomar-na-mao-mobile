import type { IAuthSupabase } from '@/domain/models/auth/auth-supabase.model';
import type { Session } from '@supabase/supabase-js';
import { authService } from '../services/auth/auth-service';

type AuthStateCallback = (session: Session | null) => void;

class AuthRepository implements IAuthSupabase {
  async signIn(email: string, password: string) {
    const { data, error } = await authService.signIn(email, password);

    return { data, error };
  }

  async resetPassword(email: string) {
    const { data, error } = await authService.resetPassword(email);

    return { data, error };
  }

  async signOut() {
    const { error } = await authService.signOut();

    return { error };
  }

  async getSession() {
    const { data } = await authService.getSession();
    return data.session;
  }

  onAuthStateChange(callback: AuthStateCallback) {
    return authService.onAuthStateChange(callback);
  }
}

export const authRepository = new AuthRepository();
