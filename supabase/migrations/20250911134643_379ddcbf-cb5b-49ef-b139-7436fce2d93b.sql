-- Create generation_usage table to track monthly AI invoice generation usage
CREATE TABLE public.generation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- Format: '2024-01' for January 2024
  generation_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable Row Level Security
ALTER TABLE public.generation_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for generation_usage
CREATE POLICY "Users can view own generation usage" 
ON public.generation_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own generation usage" 
ON public.generation_usage 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generation usage" 
ON public.generation_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_generation_usage_updated_at
BEFORE UPDATE ON public.generation_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();