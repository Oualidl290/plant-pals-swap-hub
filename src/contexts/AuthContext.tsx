
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session, User } from '@supabase/supabase-js';
import { cleanupAuthState } from "@/lib/auth-utils";

export type AuthStatus = "authenticated" | "unauthenticated" | "loading";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{
    success: boolean;
    error: any | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    success: boolean;
    error: any | null;
  }>;
  signInWithMagicLink: (email: string) => Promise<{
    success: boolean;
    error: any | null;
  }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    success: boolean;
    error: any | null;
  }>;
  updateProfile: (data: { username?: string, avatar_url?: string, bio?: string, location?: string }) => Promise<{
    success: boolean;
    error: any | null;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setStatus(session ? "authenticated" : "unauthenticated");

        // Defer data fetching to prevent deadlocks
        if (session?.user && event === "SIGNED_IN") {
          setTimeout(() => {
            // Could fetch additional user data here if needed
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setStatus(session ? "authenticated" : "unauthenticated");
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Please check your email for a confirmation link."
      });
      
      return { success: true, error: null };
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Welcome back",
        description: "You've successfully signed in."
      });
      
      return { success: true, error: null };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  // Magic link sign in
  const signInWithMagicLink = async (email: string) => {
    try {
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;

      toast({
        title: "Magic link sent",
        description: "Check your email for the login link."
      });
      
      return { success: true, error: null };
    } catch (error: any) {
      toast({
        title: "Error sending magic link",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  // Google sign in
  const signInWithGoogle = async () => {
    cleanupAuthState();
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out."
      });
      
      // Force page reload for a clean state
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Check your email for the reset link."
      });
      
      return { success: true, error: null };
    } catch (error: any) {
      toast({
        title: "Error resetting password",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  // Update profile
  const updateProfile = async (data: { username?: string, avatar_url?: string, bio?: string, location?: string }) => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
      
      return { success: true, error: null };
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const value = {
    user,
    session,
    status,
    signUp,
    signIn,
    signInWithMagicLink,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
