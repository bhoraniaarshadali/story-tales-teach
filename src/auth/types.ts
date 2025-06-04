
export interface User {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordUpdateData {
  password: string;
  confirmPassword: string;
}

export interface AuthError {
  message: string;
  field?: string;
}
