
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SignInForm } from '../auth/components/SignInForm';
import { SignUpForm } from '../auth/components/SignUpForm';
import { PasswordResetForm } from '../auth/components/PasswordResetForm';
import { AuthGuard } from '../auth/components/AuthGuard';
import { BookOpen } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'reset';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('signin');

  useEffect(() => {
    const urlMode = searchParams.get('mode') as AuthMode;
    if (urlMode && ['signin', 'signup', 'reset'].includes(urlMode)) {
      setMode(urlMode);
    }
  }, [searchParams]);

  const handleAuthSuccess = () => {
    navigate('/', { replace: true });
  };

  const updateUrl = (newMode: AuthMode) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('mode', newMode);
    navigate(`/auth?${newSearchParams.toString()}`, { replace: true });
    setMode(newMode);
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-2xl font-bold text-primary">Story Tales Teach</h1>
            </div>
            <p className="text-muted-foreground">
              {mode === 'signin' && 'Welcome back! Sign in to continue your learning journey.'}
              {mode === 'signup' && 'Join us and start learning through engaging stories.'}
              {mode === 'reset' && 'Reset your password to regain access to your account.'}
            </p>
          </div>

          {/* Forms */}
          {mode === 'signin' && (
            <SignInForm
              onSuccess={handleAuthSuccess}
              onSwitchToSignUp={() => updateUrl('signup')}
              onForgotPassword={() => updateUrl('reset')}
            />
          )}
          
          {mode === 'signup' && (
            <SignUpForm
              onSuccess={handleAuthSuccess}
              onSwitchToSignIn={() => updateUrl('signin')}
            />
          )}
          
          {mode === 'reset' && (
            <PasswordResetForm
              onSuccess={() => updateUrl('signin')}
              onBack={() => updateUrl('signin')}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default Auth;
