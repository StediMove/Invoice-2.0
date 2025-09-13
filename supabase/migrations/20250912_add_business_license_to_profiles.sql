-- Add business_license field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_license TEXT;