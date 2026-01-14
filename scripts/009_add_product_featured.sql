-- Add featured flag support for products
-- Safe to run multiple times

ALTER TABLE IF EXISTS products
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
