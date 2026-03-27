import type { ResetPasswordData } from '@/domain/models/auth/reset-password-data';
import type { SessionData } from '@/domain/models/auth/session-data.model';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase-connection';

class AuthService {
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async resetPassword(email: string): Promise<ResetPasswordData> {
    return await supabase.auth.resetPasswordForEmail(email);
  }

  async signOut() {
    return await supabase.auth.signOut();
  }

  async getSession(): Promise<SessionData> {
    return await supabase.auth.getSession();
  }

  onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }
}

export const authService = new AuthService();
