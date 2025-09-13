-- Add company branding and localization fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_currency text DEFAULT 'USD';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#3b82f6';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#8b5cf6';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#06b6d4';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS text_color text DEFAULT '#1f2937';