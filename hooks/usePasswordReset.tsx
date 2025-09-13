import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UsePasswordResetResult {
  sendResetEmail: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  loading: boolean;
}

export function usePasswordReset(): UsePasswordResetResult {
  const [loading, setLoading] = useState(false);

  const sendResetEmail = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    sendResetEmail,
    updatePassword,
    loading,
  };
}