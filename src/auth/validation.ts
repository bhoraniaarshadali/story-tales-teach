
import { SignUpData, SignInData, PasswordResetData, PasswordUpdateData, AuthError } from './types';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true };
};

export const validateSignUp = (data: SignUpData): AuthError[] => {
  const errors: AuthError[] = [];

  if (!data.name.trim()) {
    errors.push({ message: 'Name is required', field: 'name' });
  }

  if (!data.email.trim()) {
    errors.push({ message: 'Email is required', field: 'email' });
  } else if (!validateEmail(data.email)) {
    errors.push({ message: 'Please enter a valid email address', field: 'email' });
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.push({ message: passwordValidation.message!, field: 'password' });
  }

  if (data.password !== data.confirmPassword) {
    errors.push({ message: 'Passwords do not match', field: 'confirmPassword' });
  }

  return errors;
};

export const validateSignIn = (data: SignInData): AuthError[] => {
  const errors: AuthError[] = [];

  if (!data.email.trim()) {
    errors.push({ message: 'Email is required', field: 'email' });
  } else if (!validateEmail(data.email)) {
    errors.push({ message: 'Please enter a valid email address', field: 'email' });
  }

  if (!data.password.trim()) {
    errors.push({ message: 'Password is required', field: 'password' });
  }

  return errors;
};

export const validatePasswordReset = (data: PasswordResetData): AuthError[] => {
  const errors: AuthError[] = [];

  if (!data.email.trim()) {
    errors.push({ message: 'Email is required', field: 'email' });
  } else if (!validateEmail(data.email)) {
    errors.push({ message: 'Please enter a valid email address', field: 'email' });
  }

  return errors;
};

export const validatePasswordUpdate = (data: PasswordUpdateData): AuthError[] => {
  const errors: AuthError[] = [];

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.push({ message: passwordValidation.message!, field: 'password' });
  }

  if (data.password !== data.confirmPassword) {
    errors.push({ message: 'Passwords do not match', field: 'confirmPassword' });
  }

  return errors;
};

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};
