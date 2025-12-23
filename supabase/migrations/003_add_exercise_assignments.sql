-- Create exercise_assignments table for many-to-many relationship
-- between exercises and users
CREATE TABLE IF NOT EXISTS exercise_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(exercise_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE exercise_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for exercise_assignments
-- Admins can view all assignments
CREATE POLICY "Admins can view all assignments"
  ON exercise_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Users can view their own assignments
CREATE POLICY "Users can view their own assignments"
  ON exercise_assignments FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can insert assignments
CREATE POLICY "Admins can insert assignments"
  ON exercise_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Admins can update assignments
CREATE POLICY "Admins can update assignments"
  ON exercise_assignments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Admins can delete assignments
CREATE POLICY "Admins can delete assignments"
  ON exercise_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_exercise_assignments_exercise_id ON exercise_assignments(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_assignments_user_id ON exercise_assignments(user_id);

