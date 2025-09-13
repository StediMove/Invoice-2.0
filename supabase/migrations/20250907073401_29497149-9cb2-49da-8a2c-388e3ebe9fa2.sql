-- Add missing company_name column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN company_name TEXT,
ADD COLUMN business_address TEXT,
ADD COLUMN phone TEXT,
ADD COLUMN website TEXT,
ADD COLUMN tax_id TEXT;

-- Update invoice_templates table to include more template fields
ALTER TABLE public.invoice_templates 
ADD COLUMN color_scheme TEXT DEFAULT 'blue',
ADD COLUMN font_family TEXT DEFAULT 'inter',
ADD COLUMN logo_url TEXT,
ADD COLUMN header_text TEXT,
ADD COLUMN footer_text TEXT;