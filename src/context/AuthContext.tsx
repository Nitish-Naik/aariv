"use client";

import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { User } from "@/lib/types";
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
  signInWithGoogle: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSupabaseUser(sbUser: any): User {
  return {
    id: sbUser.id,
    email: sbUser.email!,
    name: sbUser.user_metadata?.full_name || sbUser.email!.split("@")[0],
    avatar: sbUser.user_metadata?.avatar_url,
    googleId:
      sbUser.app_metadata?.provider === "google"
        ? sbUser.identities?.[0]?.id || ""
        : "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastSyncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
      setIsLoading(false);
    };
    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const mappedUser = mapSupabaseUser(session.user);
        setUser(mappedUser);

        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          syncWithBackend(mappedUser);
        }
      } else {
        setUser(null);
        lastSyncedUserIdRef.current = null;
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function syncWithBackend(mappedUser: User) {
    if (lastSyncedUserIdRef.current === mappedUser.id) return;
    lastSyncedUserIdRef.current = mappedUser.id;

    try {
      await api.post("/auth/sync", {
        name: mappedUser.name,
        avatar: mappedUser.avatar,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    } catch {
      // Backend sync failure is non-fatal — user can still use the app
    }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signOut, signInWithGoogle }}
    >
      {children}
    </AuthContext.Provider>
  );
}
