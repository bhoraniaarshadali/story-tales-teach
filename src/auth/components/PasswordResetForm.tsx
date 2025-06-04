
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { validatePasswordReset } from '../validation';
import { PasswordResetData, AuthError } from '../types';
import { useAuth } from '../hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

interface PasswordResetFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ onSuccess, onBack }) => {
  const { resetPassword } = useAuth();
  const [formData, setFormData] = useState<PasswordResetData>({
    email: ''
  });
  const [errors, setErrors] = useState<AuthError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleInputChange = (field: keyof PasswordResetData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific errors when user starts typing
    setErrors(prev => prev.filter(error => error.field !== field));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validatePasswordReset(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      await resetPassword(formData.email);
      setEmailSent(true);
      toast({
        title: "Reset email sent!",
        description: "Please check your email for password reset instructions.",
      });
      onSuccess?.();
    } catch (error: any) {
      setErrors([{ message: error.message || 'An error occurred while sending reset email' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  if (emailSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              We've sent password reset instructions to <strong>{formData.email}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Check your email and follow the link to reset your password.
            </p>
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
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
              placeholder="Enter your email address"
            />
            {getFieldError('email') && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {getFieldError('email')}
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
            {isLoading ? 'Sending Reset Email...' : 'Send Reset Email'}
          </Button>

          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
