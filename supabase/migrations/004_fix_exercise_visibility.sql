-- Create a function to check if user can see an exercise
CREATE OR REPLACE FUNCTION public.user_can_see_exercise(exercise_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
  has_assignment BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT is_admin INTO is_admin
  FROM profiles
  WHERE id = user_id_param;
  
  -- Admins can see everything
  IF is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Check if exercise has any assignments
  SELECT EXISTS (
    SELECT 1 FROM exercise_assignments
    WHERE exercise_assignments.exercise_id = exercise_id_param
  ) INTO has_assignment;
  
  -- If no assignments, exercise is available to all
  IF NOT has_assignment THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has assignment
  SELECT EXISTS (
    SELECT 1 FROM exercise_assignments
    WHERE exercise_assignments.exercise_id = exercise_id_param
    AND exercise_assignments.user_id = user_id_param
  ) INTO has_assignment;
  
  RETURN has_assignment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update policy to allow users to see assignments for exercises they can access
DROP POLICY IF EXISTS "Users can view their own assignments" ON exercise_assignments;

CREATE POLICY "Users can view assignments for accessible exercises"
  ON exercise_assignments FOR SELECT
  USING (
    -- Admins can see all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
    OR
    -- Users can see their own assignments
    auth.uid() = user_id
    OR
    -- Users can see assignments for exercises they can access (to check if exercise is available to all)
    NOT EXISTS (
      SELECT 1 FROM exercise_assignments ea2
      WHERE ea2.exercise_id = exercise_assignments.exercise_id
      AND ea2.user_id != auth.uid()
    )
  );

