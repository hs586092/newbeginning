-- Migration: Add full_name column to profiles table if it doesn't exist
-- This fixes the database schema error: column profiles.full_name does not exist

-- Check if full_name column exists, and add it if it doesn't
DO $$
BEGIN
    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'full_name'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;

    -- Add index for better query performance
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'profiles'
        AND indexname = 'idx_profiles_full_name'
    ) THEN
        CREATE INDEX idx_profiles_full_name ON public.profiles(full_name);
    END IF;
END
$$;

-- Update existing profiles to set full_name from username if null
UPDATE public.profiles
SET full_name = username
WHERE full_name IS NULL OR full_name = '';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.full_name IS 'Display name for user profile, defaults to username if not provided';