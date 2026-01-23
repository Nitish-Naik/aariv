/**
 * Authentication service - Real implementation using backend
 */

import * as AuthSession from "expo-auth-session";

import * as WebBrowser from "expo-web-browser";

import { supabase } from "./supabaseClient"; 

import type { User } from "../types";



export interface AuthResult {

  user: User;

  session: any;

}



// Ensure WebBrowser can handle redirects

WebBrowser.maybeCompleteAuthSession();



/**

 * Sign in with Google using Supabase Auth

 */

export async function signInWithGoogle(): Promise<void> {

  try {

    const redirectUri = AuthSession.makeRedirectUri({

        scheme: 'aariv',

        path: 'auth/callback'

    });



    const { data, error } = await supabase.auth.signInWithOAuth({

      provider: 'google',

      options: {

        redirectTo: redirectUri,

        skipBrowserRedirect: true,

      },

    });



    if (error) throw error;

    if (!data.url) throw new Error("No OAuth URL returned from Supabase");



    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);



    if (result.type !== "success") {

        throw new Error("Sign in cancelled");

    }



    // Parse session from URL

    const params = new URLSearchParams(result.url.split("#")[1]);

    const accessToken = params.get("access_token");

    const refreshToken = params.get("refresh_token");



    if (accessToken && refreshToken) {

        await supabase.auth.setSession({

            access_token: accessToken,

            refresh_token: refreshToken,

        });

    }



  } catch (error: any) {

    console.error("Supabase Login Failed:", error);

    throw error;

  }

}



/**

 * Sign out

 */

export async function signOut(): Promise<void> {

  await supabase.auth.signOut();

}



/**

 * Get current user from Supabase session

 */

export async function getCurrentUser(): Promise<User | null> {

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;



  return {

    id: user.id,

    email: user.email!,

    name: user.user_metadata?.full_name || user.email!.split('@')[0],

    avatar: user.user_metadata?.avatar_url,

    googleId: user.app_metadata?.provider === 'google' ? user.identities?.[0]?.id || '' : '',

  };

}



/**

 * Check if user is signed in

 */

export async function isSignedIn(): Promise<boolean> {

  const { data: { session } } = await supabase.auth.getSession();

  return !!session;

}



/**

 * Delete account

 */

export async function deleteAccount(): Promise<void> {

  try {

    // In a real app, you might want to call a backend function to clean up user data

    // before calling supabase.auth.signOut() or using the admin API to delete.

    // For now, we just sign out.

    await signOut();

  } catch (error) {

    console.error("Delete Account Failed:", error);

    await signOut();

    throw error;

  }

}



