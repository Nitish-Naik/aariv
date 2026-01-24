import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api'; // Import API client
import { supabase } from '../services/supabaseClient';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => { },
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();
  const lastSyncedUserIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    // 1. Initial check
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const mappedUser = mapSupabaseUser(session.user);
        setUser(mappedUser);
        // We rely on onAuthStateChange for syncing to avoid duplicates
      }
      setIsLoading(false);
    };
    initAuth();

    // 2. Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const mappedUser = mapSupabaseUser(session.user);
        setUser(mappedUser);

        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          syncWithBackend(mappedUser);
        }
      } else {
        setUser(null);
        lastSyncedUserIdRef.current = null; // Reset on sign out
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function syncWithBackend(mappedUser: User) {
    // Idempotency: Skip if we already synced (or are syncing) this user
    if (lastSyncedUserIdRef.current === mappedUser.id) {
      return;
    }

    // Optimistic lock: Mark as synced immediately to prevent race conditions
    lastSyncedUserIdRef.current = mappedUser.id;

    try {
      // Send sync request to backend
      await api.post('/auth/sync', {
        name: mappedUser.name,
        avatar: mappedUser.avatar
      });
      console.log("Backend sync successful");
    } catch (e: any) {
      // Non-blocking error. Backend might be down or unreachable.
      // We don't want to block the UI for this background task.
      console.warn("Backend sync failed (running in offline/auth-only mode):", e.message);

      // Optional: We DO NOT reset the ref here. 
      // If we failed, we failed. Constant retrying on every nav/render is exactly what we want to avoid.
      // The user can try again by reloading the app (which resets the ref).
    }
  }

  function mapSupabaseUser(sbUser: any): User {
    return {
      id: sbUser.id,
      email: sbUser.email!,
      name: sbUser.user_metadata?.full_name || sbUser.email!.split('@')[0],
      avatar: sbUser.user_metadata?.avatar_url,
      googleId: sbUser.app_metadata?.provider === 'google' ? sbUser.identities?.[0]?.id || '' : '',
    };
  }

  useEffect(() => {
    if (isLoading) return;

    const inPublicGroup = segments[0] === 'login' ||
      segments[0] === 'onboarding' ||
      segments[0] === 'legal';

    // If user is logged in
    if (user) {
      // Redirect from login/onboarding/index to main app
      if (segments[0] === 'login' || segments[0] === 'onboarding' || segments.length === 0) {
        router.replace('/(tabs)');
      }
    } else {
      // If user is NOT logged in and NOT on a public page, redirect to login
      if (!inPublicGroup) {
        router.replace('/login');
      }
    }
  }, [user, isLoading, segments]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
