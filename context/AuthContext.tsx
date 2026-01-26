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
      console.log(`🔐 Auth State Changed: ${event}`, session?.user?.email); // DEBUG
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
      // DEBUG: Check what we are sending
      console.log("🔄 Initiating Backend Sync for:", mappedUser.email);
      const { data: { session } } = await supabase.auth.getSession();
      console.log("🔑 Auth Token Available:", !!session?.access_token);
      // console.log("🔑 Token:", session?.access_token); // Uncomment to see full token if needed

      // Send sync request to backend
      await api.post('/auth/sync', {
        name: mappedUser.name,
        avatar: mappedUser.avatar
      });
      console.log("✅ Backend sync successful");
    } catch (e: any) {
      // Non-blocking error. Backend might be down or unreachable.
      // We don't want to block the UI for this background task.
      console.warn("❌ Backend sync failed:", e.message);
      console.warn("Details:", e);

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
      segments[0] === 'legal';

    // If user is logged in
    if (user) {
      // Redirect from login/index to onboarding (Gatekeeper)
      if (segments[0] === 'login' || segments.length === 0) {
        router.replace('/onboarding');
      }
      // Note: We do NOT redirect away from 'onboarding' here. 
      // The OnboardingScreen itself handles the forward navigation to /(tabs) when complete.
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
