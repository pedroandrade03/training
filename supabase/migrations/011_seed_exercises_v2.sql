-- Seed exercises based on user request (v2)
-- Clears existing data and inserts exercises with specific set/rep schemes

-- Clear existing data (CAUTION: This deletes all logs and exercises)
DELETE FROM public.workout_sets;
DELETE FROM public.workout_logs;
DELETE FROM public.exercise_assignments;
DELETE FROM public.exercises;

-- Insert exercises
INSERT INTO public.exercises (name, category, suggested_reps) VALUES
-- PUSH
('Supino inclinado', 'Push', '2x5-9'),
('Supino declinado', 'Push', '2x5-9'),
('Crucifixo voador', 'Push', '2x5-9'),
('Desenvolvimento', 'Push', '1x5-9'),
('Elevação lateral', 'Push', '2x5-9'),
('Tríceps corda polia', 'Push', '2x5-9'),
('Tríceps coice', 'Push', '1x5-9'),
('Abdominal máquina', 'Push', '2x5-9'),
('Abdominal máquina lateral', 'Push', '1x5-9'),

-- PULL
('Puxada alta triângulo', 'Pull', '2x5-9'),
('Remada pegada triângulo', 'Pull', '2x5-9'),
('T-Bar (Remada cavalinho)', 'Pull', '2x5-9'),
('Crucifixo inverso', 'Pull', '2x5-9'),
('Rosca Scott', 'Pull', '2x5-9'),
('Rosca polia', 'Pull', '2x5-9'),

-- LEGS
('Agachamento Smith', 'Legs', '2x5-9'),
('Hack linear', 'Legs', '2x5-9'),
('Cadeira extensora unilateral', 'Legs', '2x5-9'),
('Mesa flexora', 'Legs', '2x5-9'),
('Elevação pélvica', 'Legs', '2x5-9'),
('Panturrilha', 'Legs', '2x5-9'),
('Abdominal máquina', 'Legs', '2x5-9'),
('Abdominal máquina lateral', 'Legs', '1x5-9'),

-- UPPER
('Supino inclinado', 'Upper', '2x5-9'),
('Puxada alta pegada aberta', 'Upper', '2x5-9'),
('Crucifixo voador', 'Upper', '2x5-9'),
('Remada baixa triângulo', 'Upper', '2x5-9'),
('Crucifixo inverso', 'Upper', '1x5-9'),
('Elevação lateral', 'Upper', '1x5-9'),
('Bíceps', 'Upper', '1x5-9'),
('Tríceps', 'Upper', '1x5-9'),
('Abdominal máquina', 'Upper', '2x5-9'),
('Abdominal máquina lateral', 'Upper', '1x5-9'),

-- LOWER
('Hack squat', 'Lower', '2x5-9'),
('Stiff', 'Lower', '2x5-9'),
('Cadeira extensora unilateral', 'Lower', '2x5-9'),
('Mesa flexora', 'Lower', '2x5-9'),
('Cadeira flexora', 'Lower', '2x5-9'),
('Panturrilha sentada', 'Lower', '2x5-9');
