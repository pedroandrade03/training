-- Seed exercises with Many-to-Many categories relationship
-- This script clears existing exercises and repopulates them with the new structure

-- Clear existing data
DELETE FROM public.workout_sets;
DELETE FROM public.workout_logs;
DELETE FROM public.exercise_categories;
DELETE FROM public.exercise_assignments;
DELETE FROM public.exercises;

-- Ensure categories exist
INSERT INTO categories (name) VALUES
('Push'), ('Pull'), ('Legs'), ('Upper'), ('Lower')
ON CONFLICT (name) DO NOTHING;

-- Function to insert exercise and link to categories
CREATE OR REPLACE FUNCTION insert_exercise_v2(
  p_name TEXT,
  p_reps TEXT,
  p_category_names TEXT[]
) RETURNS VOID AS $$
DECLARE
  v_exercise_id UUID;
  v_cat_name TEXT;
  v_cat_id UUID;
BEGIN
  -- Insert exercise
  INSERT INTO exercises (name, suggested_reps)
  VALUES (p_name, p_reps)
  RETURNING id INTO v_exercise_id;

  -- Link categories
  FOREACH v_cat_name IN ARRAY p_category_names
  LOOP
    SELECT id INTO v_cat_id FROM categories WHERE name = v_cat_name;
    
    IF v_cat_id IS NOT NULL THEN
      INSERT INTO exercise_categories (exercise_id, category_id)
      VALUES (v_exercise_id, v_cat_id);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert Exercises (Unified)

-- PUSH / UPPER
SELECT insert_exercise_v2('Supino inclinado', '2x5-9', ARRAY['Push', 'Upper']);
SELECT insert_exercise_v2('Supino declinado', '2x5-9', ARRAY['Push']);
SELECT insert_exercise_v2('Crucifixo voador', '2x5-9', ARRAY['Push', 'Upper']);
SELECT insert_exercise_v2('Desenvolvimento', '1x5-9', ARRAY['Push']);
SELECT insert_exercise_v2('Elevação lateral', '2x5-9', ARRAY['Push', 'Upper']); -- Upper tem 1x, Push 2x? User disse 2x no Push e 1x no Upper. Vou manter 2x.
SELECT insert_exercise_v2('Tríceps corda polia', '2x5-9', ARRAY['Push']);
SELECT insert_exercise_v2('Tríceps coice', '1x5-9', ARRAY['Push']);
SELECT insert_exercise_v2('Abdominal máquina', '2x5-9', ARRAY['Push', 'Legs', 'Upper']); -- Aparece em Push, Legs e Upper

-- PULL / UPPER
SELECT insert_exercise_v2('Puxada alta triângulo', '2x5-9', ARRAY['Pull']);
SELECT insert_exercise_v2('Remada pegada triângulo', '2x5-9', ARRAY['Pull']);
SELECT insert_exercise_v2('T-Bar (Remada cavalinho)', '2x5-9', ARRAY['Pull']);
SELECT insert_exercise_v2('Crucifixo inverso', '2x5-9', ARRAY['Pull', 'Upper']);
SELECT insert_exercise_v2('Rosca Scott', '2x5-9', ARRAY['Pull']);
SELECT insert_exercise_v2('Rosca polia', '2x5-9', ARRAY['Pull']);
SELECT insert_exercise_v2('Puxada alta pegada aberta', '2x5-9', ARRAY['Upper']);
SELECT insert_exercise_v2('Remada baixa triângulo', '2x5-9', ARRAY['Upper']);
SELECT insert_exercise_v2('Bíceps', '1x5-9', ARRAY['Upper']);
SELECT insert_exercise_v2('Tríceps', '1x5-9', ARRAY['Upper']); -- Genérico

-- LEGS / LOWER
SELECT insert_exercise_v2('Agachamento Smith', '2x5-9', ARRAY['Legs']);
SELECT insert_exercise_v2('Hack linear', '2x5-9', ARRAY['Legs']);
SELECT insert_exercise_v2('Cadeira extensora unilateral', '2x5-9', ARRAY['Legs', 'Lower']);
SELECT insert_exercise_v2('Mesa flexora', '2x5-9', ARRAY['Legs', 'Lower']);
SELECT insert_exercise_v2('Elevação pélvica', '2x5-9', ARRAY['Legs']);
SELECT insert_exercise_v2('Panturrilha', '2x5-9', ARRAY['Legs']);
SELECT insert_exercise_v2('Abdominal máquina lateral', '1x5-9', ARRAY['Push', 'Legs', 'Upper']);

SELECT insert_exercise_v2('Hack squat', '2x5-9', ARRAY['Lower']);
SELECT insert_exercise_v2('Stiff', '2x5-9', ARRAY['Lower']);
SELECT insert_exercise_v2('Cadeira flexora', '2x5-9', ARRAY['Lower']);
SELECT insert_exercise_v2('Panturrilha sentada', '2x5-9', ARRAY['Lower']);

-- Clean up helper function
DROP FUNCTION insert_exercise_v2;

