-- Add cardio exercise support

-- 1. Add exercise_type column to exercises table
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS exercise_type TEXT DEFAULT 'strength' CHECK (exercise_type IN ('strength', 'cardio'));

-- 2. Create cardio_logs table for cardio-specific data
CREATE TABLE IF NOT EXISTS cardio_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_log_id UUID REFERENCES workout_logs(id) ON DELETE CASCADE NOT NULL UNIQUE,
  duration_minutes DECIMAL(10, 2) NOT NULL,
  speed DECIMAL(10, 2), -- km/h for treadmill and elliptical
  resistance INTEGER, -- level for elliptical and bike
  incline DECIMAL(10, 2), -- percentage for treadmill only
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Enable RLS for cardio_logs
ALTER TABLE cardio_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for cardio_logs
-- Users can view their own cardio logs
CREATE POLICY "Users can view their own cardio logs"
  ON cardio_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = cardio_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

-- Users can insert their own cardio logs
CREATE POLICY "Users can insert their own cardio logs"
  ON cardio_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = cardio_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

-- Users can update their own cardio logs
CREATE POLICY "Users can update their own cardio logs"
  ON cardio_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = cardio_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

-- Users can delete their own cardio logs
CREATE POLICY "Users can delete their own cardio logs"
  ON cardio_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = cardio_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

-- 5. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_cardio_logs_workout_log_id ON cardio_logs(workout_log_id);
CREATE INDEX IF NOT EXISTS idx_exercises_type ON exercises(exercise_type);

-- 6. Insert initial cardio exercises
-- Ensure categories exist first
INSERT INTO categories (name) VALUES
('Cardio')
ON CONFLICT (name) DO NOTHING;

-- Insert cardio exercises
INSERT INTO exercises (name, suggested_reps, exercise_type) VALUES
('Elíptica', 'Tempo: minutos', 'cardio'),
('Bicicleta', 'Tempo: minutos', 'cardio'),
('Esteira', 'Tempo: minutos', 'cardio')
ON CONFLICT DO NOTHING;

-- Link cardio exercises to Cardio category
INSERT INTO exercise_categories (exercise_id, category_id)
SELECT e.id, c.id
FROM exercises e
CROSS JOIN categories c
WHERE e.exercise_type = 'cardio'
  AND c.name = 'Cardio'
  AND NOT EXISTS (
    SELECT 1 FROM exercise_categories ec
    WHERE ec.exercise_id = e.id AND ec.category_id = c.id
  );

