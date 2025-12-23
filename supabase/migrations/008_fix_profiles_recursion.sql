-- Fix infinite recursion in profiles policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a function that admins can use to get all profiles
-- This function uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.get_all_profiles()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  current_user_id UUID;
  user_is_admin_flag BOOLEAN;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if current user is admin (bypass RLS using SECURITY DEFINER)
  SELECT p.is_admin INTO user_is_admin_flag
  FROM profiles p
  WHERE p.id = current_user_id;
  
  IF NOT COALESCE(user_is_admin_flag, false) THEN
    RAISE EXCEPTION 'Only admins can view all profiles';
  END IF;
  
  -- Return all profiles
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.name,
    p.avatar_url,
    p.is_admin,
    p.created_at
  FROM profiles p
  ORDER BY COALESCE(p.name, p.email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

