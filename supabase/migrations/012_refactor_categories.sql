-- Refactor categories to Many-to-Many relationship

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create exercise_categories junction table
CREATE TABLE IF NOT EXISTS exercise_categories (
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (exercise_id, category_id)
);

-- 3. Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_categories ENABLE ROW LEVEL SECURITY;

-- 4. Policies for categories
-- Everyone can view categories
CREATE POLICY "Everyone can view categories"
  ON categories FOR SELECT
  USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- 5. Policies for exercise_categories
-- Everyone can view associations
CREATE POLICY "Everyone can view exercise categories"
  ON exercise_categories FOR SELECT
  USING (true);

-- Only admins can manage associations
CREATE POLICY "Admins can manage exercise categories"
  ON exercise_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- 6. Insert initial categories
INSERT INTO categories (name) VALUES
('Push'),
('Pull'),
('Legs'),
('Upper'),
('Lower')
ON CONFLICT (name) DO NOTHING;

-- 7. Helper function to get exercises with their categories
CREATE OR REPLACE FUNCTION public.get_exercises_with_categories()
RETURNS TABLE (
  id UUID,
  name TEXT,
  suggested_reps TEXT,
  exercise_type TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  categories JSONB,
  assigned_user_ids UUID[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.suggested_reps,
    COALESCE(e.exercise_type, 'strength')::TEXT as exercise_type,
    e.created_by,
    e.created_at,
    COALESCE(
      jsonb_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name)) FILTER (WHERE c.id IS NOT NULL),
      '[]'::jsonb
    ) as categories,
    COALESCE(
      array_agg(DISTINCT ea.user_id) FILTER (WHERE ea.user_id IS NOT NULL),
      '{}'::UUID[]
    ) as assigned_user_ids
  FROM exercises e
  LEFT JOIN exercise_categories ec ON ec.exercise_id = e.id
  LEFT JOIN categories c ON c.id = ec.category_id
  LEFT JOIN exercise_assignments ea ON ea.exercise_id = e.id
  GROUP BY e.id, e.exercise_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

