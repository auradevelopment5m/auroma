-- Add available colors support for products
-- Safe to run multiple times

ALTER TABLE IF EXISTS products
ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}';
