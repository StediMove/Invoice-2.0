import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';

interface GenerationUsage {
  generationCount: number;
  canGenerate: boolean;
  remainingGenerations: number;
  maxGenerations: number;
}

export function useGenerationLimits(): GenerationUsage & { 
  recordGeneration: () => Promise<boolean>;
  refreshUsage: () => Promise<void>;
} {
  const { user } = useAuth();
  const { subscribed, subscriptionTier } = useSubscription();
  const [generationCount, setGenerationCount] = useState(0);
  
  const currentMonthYear = new Date().toISOString().slice(0, 7); // Format: '2024-01'
  
  // Determine max generations based on subscription
  const getMaxGenerations = () => {
    if (subscribed && subscriptionTier === 'Professional') {
      return Infinity; // Unlimited for Professional subscribers
    }
    return 5; // 5 for free users
  };

  const maxGenerations = getMaxGenerations();
  const remainingGenerations = (subscribed && subscriptionTier === 'Professional') ? Infinity : Math.max(0, maxGenerations - generationCount);
  const canGenerate = (subscribed && subscriptionTier === 'Professional') || generationCount < maxGenerations;

  const refreshUsage = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('generation_usage')
        .select('generation_count')
        .eq('user_id', user.id)
        .eq('month_year', currentMonthYear)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching generation usage:', error);
        return;
      }

      setGenerationCount(data?.generation_count || 0);
    } catch (error) {
      console.error('Error refreshing usage:', error);
    }
  };

  const recordGeneration = async (): Promise<boolean> => {
    if (!user) return false;
    
    // Check if user can generate
    if (!canGenerate) {
      return false;
    }

    try {
      // Upsert the generation usage record
      const { error } = await supabase
        .from('generation_usage')
        .upsert({
          user_id: user.id,
          month_year: currentMonthYear,
          generation_count: generationCount + 1,
        }, {
          onConflict: 'user_id,month_year'
        });

      if (error) {
        console.error('Error recording generation:', error);
        return false;
      }

      // Update local state
      setGenerationCount(prev => prev + 1);
      return true;
    } catch (error) {
      console.error('Error recording generation:', error);
      return false;
    }
  };

  useEffect(() => {
    refreshUsage();
  }, [user, currentMonthYear]);

  return {
    generationCount,
    canGenerate,
    remainingGenerations,
    maxGenerations,
    recordGeneration,
    refreshUsage
  };
}