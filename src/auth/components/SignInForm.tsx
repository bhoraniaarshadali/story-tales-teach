
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { validateSignIn } from '../validation';
import { SignInData, AuthError } from '../types';
import { useAuth } from '../hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

interface SignInFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
  onForgotPassword?: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ 
  onSuccess, 
  onSwitchToSignUp, 
  onForgotPassword 
}) => {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState<SignInData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<AuthError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof SignInData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific errors when user starts typing
    setErrors(prev => prev.filter(error => error.field !== field));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateSignIn(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      await signIn(formData.email, formData.password);
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      onSuccess?.();
    } catch (error: any) {
      setErrors([{ message: error.message || 'An error occurred during signin' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={getFieldError('email') ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {getFieldError('email') && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {getFieldError('email')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={getFieldError('password') ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {getFieldError('password') && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {getFieldError('password')}
              </p>
            )}
          </div>

          {errors.filter(error => !error.field).map((error, index) => (
            <p key={index} className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {error.message}
            </p>
          ))}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          {onForgotPassword && (
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm"
                onClick={onForgotPassword}
              >
                Forgot your password?
              </Button>
            </div>
          )}

          {onSwitchToSignUp && (
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={onSwitchToSignUp}
              >
                Sign up
              </Button>
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
