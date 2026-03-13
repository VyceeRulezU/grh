-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO FIX THE "NUMERIC" ERROR ONCE AND FOR ALL
-- This command will change the price from a number to a text field, 
-- allowing you to enter "Free" or leave it empty without crashing.

ALTER TABLE IF EXISTS public.courses ALTER COLUMN price TYPE text USING price::text;
ALTER TABLE IF EXISTS public.courses ALTER COLUMN price SET DEFAULT '0';
