import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { StarBorder } from '@/components/ui/star-border';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Function to generate a random 6-digit code
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to send code via custom email function
const sendResetCodeEmail = async (email: string, code: string) => {
  try {
    const response = await fetch('/functions/v1/send-reset-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }
    
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'verify' | 'reset' | 'success'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [expectedCode, setExpectedCode] = useState(''); // Store the expected code for manual verification
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check URL parameters
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const stepParam = searchParams.get('step');
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
    
    if (stepParam === 'reset') {
      setStep('reset');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate a 6-digit code
      const code = generateCode();
      setExpectedCode(code);
      
      // Store the code in localStorage with expiration (30 minutes)
      const expirationTime = Date.now() + 30 * 60 * 1000; // 30 minutes
      localStorage.setItem(`reset_code_${email}`, JSON.stringify({
        code,
        expiration: expirationTime
      }));
      
      // Send the code via email
      const { error } = await sendResetCodeEmail(email, code);
      
      if (error) {
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive',
        });
      } else {
        setStep('verify');
        toast({
          title: 'Email Sent',
          description: 'Check your email for a 6-digit verification code.',
          duration: 15000,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug: Log verification attempt
    console.log('Verifying code:', { email, enteredCode: verificationCode });
    
    if (verificationCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit code.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Retrieve the stored code from localStorage
      const storedData = localStorage.getItem(`reset_code_${email}`);
      
      if (!storedData) {
        toast({
          title: 'Invalid Code',
          description: 'No verification code found. Please request a new code.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      const { code, expiration } = JSON.parse(storedData);
      
      // Check if the code has expired
      if (Date.now() > expiration) {
        toast({
          title: 'Invalid Code',
          description: 'The verification code has expired. Please request a new code.',
          variant: 'destructive',
        });
        localStorage.removeItem(`reset_code_${email}`);
        setLoading(false);
        return;
      }
      
      // Check if the entered code matches the stored code
      if (code !== verificationCode) {
        toast({
          title: 'Invalid Code',
          description: 'The verification code is incorrect. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      // Code is valid, remove it from localStorage
      localStorage.removeItem(`reset_code_${email}`);
      
      // Proceed to reset password
      setStep('reset');
      // Update URL to reflect the step
      navigate(`/forgot-password?step=reset&email=${encodeURIComponent(email)}`, { replace: true });
      toast({
        title: 'Code Verified',
        description: 'Please enter your new password.',
      });
    } catch (error: any) {
      console.log('Code verification exception:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (pwd: string) => {
    const minLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    
    return minLength && hasUpperCase && hasLowerCase && hasNumbers;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(newPassword)) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 8 characters with uppercase, lowercase, and numbers.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords Don\'t Match',
        description: 'Please make sure both passwords are identical.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // To update the password, we need to use Supabase's reset flow
      // but we'll do it without the automatic verification step
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forgot-password?step=reset&email=${encodeURIComponent(email)}`,
      });

      if (resetError) {
        throw new Error(resetError.message);
      }
      
      // Now update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }
      
      // Show success message
      setStep('success');
      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully updated.',
      });
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setExpectedCode('');
    // Clear URL parameters
    navigate('/forgot-password', { replace: true });
  };

  // Step 1: Email Input
  if (step === 'email') {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-background">
        <div className="absolute inset-0">
          <BackgroundPaths title="" ctaText="" ctaAction={() => {}} />
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Card className="p-8 bg-background/80 backdrop-blur-md border-border/50">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Forgot Password?
                </h1>
                <p className="text-muted-foreground mt-2">
                  Enter your email address and we'll send you a 6-digit verification code.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email address"
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <StarBorder className="w-full">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </Button>
                </StarBorder>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Sign In
                </button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Step 2: Verify Code
  if (step === 'verify') {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-background">
        <div className="absolute inset-0">
          <BackgroundPaths title="" ctaText="" ctaAction={() => {}} />
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Card className="p-8 bg-background/80 backdrop-blur-md border-border/50">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Enter Verification Code
                </h1>
                <p className="text-muted-foreground mt-2">
                  We've sent a 6-digit code to {email}. Please enter it below.
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    placeholder="Enter 6-digit code"
                    className="bg-background/50 border-border/50 text-center text-lg tracking-wider"
                    maxLength={6}
                  />
                </div>

                <StarBorder className="w-full">
                  <Button
                    type="submit"
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                </StarBorder>
              </form>

              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Didn't receive the code? Try different email
                  </button>
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/auth')}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Sign In
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Step 3: Reset Password
  if (step === 'reset') {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-background">
        <div className="absolute inset-0">
          <BackgroundPaths title="" ctaText="" ctaAction={() => {}} />
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Card className="p-8 bg-background/80 backdrop-blur-md border-border/50">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Reset Your Password
                </h1>
                <p className="text-muted-foreground mt-2">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Enter new password"
                      className="bg-background/50 border-border/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with uppercase, lowercase, and numbers.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm new password"
                      className="bg-background/50 border-border/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <StarBorder className="w-full">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </StarBorder>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Sign In
                </button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Step 4: Success
  if (step === 'success') {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-background">
        <div className="absolute inset-0">
          <BackgroundPaths title="" ctaText="" ctaAction={() => {}} />
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Card className="p-8 bg-background/80 backdrop-blur-md border-border/50">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Password Updated!
                </h1>
                <p className="text-muted-foreground mt-2">
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>
              </div>

              <Button
                onClick={() => navigate('/auth')}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Continue to Sign In
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // This should never be reached, but return email step as fallback
  return null;
}