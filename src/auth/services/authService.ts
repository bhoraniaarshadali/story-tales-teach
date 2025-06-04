
import { supabase } from '@/integrations/supabase/client';
import { SignUpData, SignInData, PasswordResetData, User } from '../types';
import { normalizeEmail } from '../validation';

export class AuthService {
  static async signUp(data: SignUpData) {
    const normalizedEmail = normalizeEmail(data.email);
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          name: data.name.trim()
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return authData;
  }

  static async signIn(data: SignInData) {
    const normalizedEmail = normalizeEmail(data.email);
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: data.password
    });

    if (error) {
      throw new Error('Invalid email or password');
    }

    return authData;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  static async resetPassword(data: PasswordResetData) {
    const normalizedEmail = normalizeEmail(data.email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/auth?mode=reset`
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  static async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(error.message);
    }
    return session;
  }

  static async getCurrentUser(): Promise<User | null> {
    const session = await this.getCurrentSession();
    if (!session?.user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name
      };
    }

    return {
      id: profile.id,
      email: session.user.email!,
      name: profile.username || session.user.user_metadata?.name,
      created_at: profile.created_at
    };
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}
