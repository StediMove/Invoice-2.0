import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { StarBorder } from '@/components/ui/star-border';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        throw error;
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
                Welcome to InvoiceAI
              </h1>
              <p className="text-muted-foreground mt-2">
                Sign in with your Google account to continue
              </p>
            </div>

            <div className="space-y-6">
              <StarBorder className="w-full">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-background hover:bg-muted text-foreground font-semibold flex items-center justify-center gap-2 border border-border"
                >
                  <FcGoogle className="w-5 h-5" />
                  {loading ? 'Signing in...' : 'Sign in with Google'}
                </Button>
              </StarBorder>
            </div>



            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}