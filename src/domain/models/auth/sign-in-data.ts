import type { Session, User, WeakPassword } from '@supabase/supabase-js';

export type SignInData =
  | { user: User; session: Session; weakPassword?: WeakPassword | undefined }
  | { user: null; session: null; weakPassword?: null | undefined };
