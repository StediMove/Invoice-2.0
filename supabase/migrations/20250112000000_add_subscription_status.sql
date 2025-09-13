-- Add subscription status and cancellation fields to subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;