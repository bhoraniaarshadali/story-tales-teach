
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { AuthService } from '../services/authService';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string, confirmPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      if (mounted) {
        setAuthState(prev => ({
          ...prev,
          user,
          isAuthenticated: !!user,
          loading: false
        }));
      }
    });

    // Check for existing session
    AuthService.getCurrentSession().then(session => {
      if (mounted) {
        setAuthState(prev => ({
          ...prev,
          session,
          loading: false
        }));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await AuthService.signIn({ email, password });
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (name: string, email: string, password: string, confirmPassword: string) => {
    try {
      await AuthService.signUp({ name, email, password, confirmPassword });
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await AuthService.resetPassword({ email });
    } catch (error) {
      throw error;
    }
  };

  const updatePassword = async (password: string, confirmPassword: string) => {
    try {
      await AuthService.updatePassword(password);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
