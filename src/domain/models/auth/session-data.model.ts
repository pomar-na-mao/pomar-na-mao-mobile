import type { AuthError, Session } from '@supabase/supabase-js';

export interface SessionData {
  data: { session: Session | null };
  error: AuthError | null;
}
