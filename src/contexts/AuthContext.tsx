import { AuthError, Session, User } from '@supabase/supabase-js';
import {
  Accessor,
  createContext,
  createEffect,
  createSignal,
  JSX,
  onCleanup,
  useContext,
} from 'solid-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: Accessor<User | null>;
  session: Accessor<Session | null>;
  loading: Accessor<boolean>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signInWithProvider: (provider: 'github' | 'google') => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: JSX.Element }) {
  const [user, setUser] = createSignal<User | null>(null);
  const [session, setSession] = createSignal<Session | null>(null);
  const [loading, setLoading] = createSignal(true);

  createEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    onCleanup(() => subscription.unsubscribe());
  });

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const signInWithProvider = async (provider: 'github' | 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const context: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
  };

  return <AuthContext.Provider value={context}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
