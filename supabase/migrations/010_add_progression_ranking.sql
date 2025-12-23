-- Create function to get progression ranking
-- This calculates the percentage increase from first weight to PR for each user
CREATE OR REPLACE FUNCTION public.get_progression_ranking()
RETURNS TABLE(
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  total_progression_percentage DECIMAL,
  average_progression_percentage DECIMAL,
  exercises_with_progression INTEGER,
  total_pr_weight DECIMAL,
  first_total_weight DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH first_weights AS (
    -- Get first weight recorded for each user-exercise combination
    SELECT 
      wl.user_id,
      wl.exercise_id,
      MIN(
        CASE 
          WHEN ws.weight IS NOT NULL THEN ws.weight
          ELSE wl.weight
        END
      ) as first_weight,
      MIN(wl.logged_at) as first_date
    FROM workout_logs wl
    LEFT JOIN workout_sets ws ON ws.workout_log_id = wl.id
    GROUP BY wl.user_id, wl.exercise_id
  ),
  pr_weights AS (
    -- Get PR (max weight) for each user-exercise combination
    SELECT 
      wl.user_id,
      wl.exercise_id,
      MAX(
        CASE 
          WHEN ws.weight IS NOT NULL THEN ws.weight
          ELSE wl.weight
        END
      ) as pr_weight
    FROM workout_logs wl
    LEFT JOIN workout_sets ws ON ws.workout_log_id = wl.id
    GROUP BY wl.user_id, wl.exercise_id
  ),
  exercise_progressions AS (
    -- Calculate progression percentage for each exercise
    SELECT 
      fw.user_id,
      fw.exercise_id,
      fw.first_weight,
      COALESCE(pr.pr_weight, fw.first_weight) as pr_weight,
      CASE 
        WHEN fw.first_weight > 0 AND pr.pr_weight IS NOT NULL THEN 
          ((pr.pr_weight - fw.first_weight) / fw.first_weight * 100)
        WHEN fw.first_weight > 0 THEN 
          ((fw.first_weight - fw.first_weight) / fw.first_weight * 100)
        ELSE 0
      END as progression_percentage
    FROM first_weights fw
    LEFT JOIN pr_weights pr ON pr.user_id = fw.user_id AND pr.exercise_id = fw.exercise_id
  ),
  user_progressions AS (
    -- Aggregate progression by user
    SELECT 
      ep.user_id,
      SUM(ep.progression_percentage) as total_progression_percentage,
      AVG(ep.progression_percentage) as average_progression_percentage,
      COUNT(*) as exercises_with_progression,
      SUM(ep.pr_weight) as total_pr_weight,
      SUM(ep.first_weight) as first_total_weight
    FROM exercise_progressions ep
    GROUP BY ep.user_id
  )
  SELECT 
    p.id as user_id,
    COALESCE(p.name, p.email, 'Usuário') as user_name,
    p.email as user_email,
    COALESCE(up.total_progression_percentage, 0)::DECIMAL as total_progression_percentage,
    COALESCE(up.average_progression_percentage, 0)::DECIMAL as average_progression_percentage,
    COALESCE(up.exercises_with_progression, 0)::INTEGER as exercises_with_progression,
    COALESCE(up.total_pr_weight, 0)::DECIMAL as total_pr_weight,
    COALESCE(up.first_total_weight, 0)::DECIMAL as first_total_weight
  FROM profiles p
  LEFT JOIN user_progressions up ON up.user_id = p.id
  WHERE up.user_id IS NOT NULL
  ORDER BY total_progression_percentage DESC, average_progression_percentage DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get weight progression over time for a user and exercise
CREATE OR REPLACE FUNCTION public.get_weight_progression(
  p_user_id UUID,
  p_exercise_id UUID DEFAULT NULL
)
RETURNS TABLE(
  date DATE,
  max_weight DECIMAL,
  exercise_id UUID,
  exercise_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_max_weights AS (
    SELECT 
      DATE(wl.logged_at) as date,
      wl.exercise_id,
      MAX(
        CASE 
          WHEN ws.weight IS NOT NULL THEN ws.weight
          ELSE wl.weight
        END
      ) as max_weight
    FROM workout_logs wl
    LEFT JOIN workout_sets ws ON ws.workout_log_id = wl.id
    WHERE wl.user_id = p_user_id
      AND (p_exercise_id IS NULL OR wl.exercise_id = p_exercise_id)
    GROUP BY DATE(wl.logged_at), wl.exercise_id
  )
  SELECT 
    dmw.date,
    dmw.max_weight::DECIMAL,
    dmw.exercise_id,
    e.name as exercise_name
  FROM daily_max_weights dmw
  JOIN exercises e ON e.id = dmw.exercise_id
  ORDER BY dmw.date ASC, e.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

