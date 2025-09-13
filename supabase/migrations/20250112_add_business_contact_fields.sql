-- Add business email and phone fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS business_email text,
ADD COLUMN IF NOT EXISTS business_phone text;