-- Fix infinite recursion in exercise_assignments policy
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view assignments for accessible exercises" ON exercise_assignments;
DROP POLICY IF EXISTS "Admins can view all assignments" ON exercise_assignments;
DROP POLICY IF EXISTS "Users can view their own assignments" ON exercise_assignments;

-- Create a function that returns exercise IDs that have assignments
-- This function uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.get_exercises_with_assignments()
RETURNS TABLE(exercise_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ea.exercise_id
  FROM exercise_assignments ea;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create simpler policies that don't cause recursion
-- Policy 1: Admins can view all assignments
CREATE POLICY "Admins can view all assignments"
  ON exercise_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Policy 2: Users can view their own assignments
CREATE POLICY "Users can view their own assignments"
  ON exercise_assignments FOR SELECT
  USING (auth.uid() = user_id);

