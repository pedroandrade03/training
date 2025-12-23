-- Add category column to exercises table
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Create workout_sets table for multiple sets per workout log
CREATE TABLE IF NOT EXISTS workout_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_log_id UUID REFERENCES workout_logs(id) ON DELETE CASCADE NOT NULL,
  set_number INTEGER NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  reps INTEGER NOT NULL,
  assisted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security for workout_sets
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

-- Workout sets policies (users can only see their own sets through workout_logs)
CREATE POLICY "Users can view their own sets"
  ON workout_sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = workout_sets.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own sets"
  ON workout_sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = workout_sets.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own sets"
  ON workout_sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = workout_sets.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own sets"
  ON workout_sets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = workout_sets.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

-- Update workout_logs to remove weight and reps (now in sets)
-- But keep them for backward compatibility, we'll deprecate later
-- Actually, let's keep them for now to maintain compatibility

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_workout_sets_log_id ON workout_sets(workout_log_id);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);

