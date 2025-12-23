-- Create exercise_preferences table for users to hide/show exercises
CREATE TABLE IF NOT EXISTS exercise_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, exercise_id)
);

-- Enable Row Level Security
ALTER TABLE exercise_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for exercise_preferences
CREATE POLICY "Users can view their own preferences"
  ON exercise_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON exercise_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON exercise_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON exercise_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_exercise_preferences_user_id ON exercise_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_preferences_exercise_id ON exercise_preferences(exercise_id);

