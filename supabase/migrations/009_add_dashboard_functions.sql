-- Create function to get user progress metrics
-- This calculates PRs (Personal Records) for each user
CREATE OR REPLACE FUNCTION public.get_user_progress_metrics()
RETURNS TABLE(
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  total_pr_weight DECIMAL,
  total_exercises_with_pr INTEGER,
  total_volume DECIMAL,
  recent_volume DECIMAL,
  pr_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH user_prs AS (
    -- Calculate PR (max weight) for each user-exercise combination
    SELECT 
      wl.user_id,
      wl.exercise_id,
      MAX(
        CASE 
          WHEN ws.weight IS NOT NULL THEN ws.weight
          ELSE wl.weight
        END
      ) as max_weight
    FROM workout_logs wl
    LEFT JOIN workout_sets ws ON ws.workout_log_id = wl.id
    GROUP BY wl.user_id, wl.exercise_id
  ),
  user_volumes AS (
    -- Calculate total volume (weight × reps) for each user
    SELECT 
      wl.user_id,
      SUM(
        CASE 
          WHEN ws.weight IS NOT NULL AND ws.reps IS NOT NULL THEN ws.weight * ws.reps
          ELSE wl.weight * wl.reps
        END
      ) as total_volume
    FROM workout_logs wl
    LEFT JOIN workout_sets ws ON ws.workout_log_id = wl.id
    GROUP BY wl.user_id
  ),
  user_recent_volumes AS (
    -- Calculate recent volume (last 30 days)
    SELECT 
      wl.user_id,
      SUM(
        CASE 
          WHEN ws.weight IS NOT NULL AND ws.reps IS NOT NULL THEN ws.weight * ws.reps
          ELSE wl.weight * wl.reps
        END
      ) as recent_volume
    FROM workout_logs wl
    LEFT JOIN workout_sets ws ON ws.workout_log_id = wl.id
    WHERE wl.logged_at >= NOW() - INTERVAL '30 days'
    GROUP BY wl.user_id
  )
  SELECT 
    p.id as user_id,
    COALESCE(p.name, p.email, 'Usuário') as user_name,
    p.email as user_email,
    COALESCE(SUM(upr.max_weight), 0)::DECIMAL as total_pr_weight,
    COUNT(DISTINCT upr.exercise_id)::INTEGER as total_exercises_with_pr,
    COALESCE(uv.total_volume, 0)::DECIMAL as total_volume,
    COALESCE(urv.recent_volume, 0)::DECIMAL as recent_volume,
    COUNT(upr.exercise_id)::INTEGER as pr_count
  FROM profiles p
  LEFT JOIN user_prs upr ON upr.user_id = p.id
  LEFT JOIN user_volumes uv ON uv.user_id = p.id
  LEFT JOIN user_recent_volumes urv ON urv.user_id = p.id
  GROUP BY p.id, p.name, p.email, uv.total_volume, urv.recent_volume
  HAVING COUNT(upr.exercise_id) > 0 OR uv.total_volume > 0
  ORDER BY total_pr_weight DESC, total_exercises_with_pr DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user progress by exercise
CREATE OR REPLACE FUNCTION public.get_user_exercise_progress(p_user_id UUID)
RETURNS TABLE(
  exercise_id UUID,
  exercise_name TEXT,
  pr_weight DECIMAL,
  pr_date TIMESTAMP WITH TIME ZONE,
  total_workouts INTEGER,
  last_workout_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  WITH exercise_prs AS (
    SELECT 
      wl.exercise_id,
      MAX(
        CASE 
          WHEN ws.weight IS NOT NULL THEN ws.weight
          ELSE wl.weight
        END
      ) as max_weight,
      MAX(
        CASE 
          WHEN ws.weight IS NOT NULL THEN wl.logged_at
          ELSE wl.logged_at
        END
      ) as pr_date
    FROM workout_logs wl
    LEFT JOIN workout_sets ws ON ws.workout_log_id = wl.id
    WHERE wl.user_id = p_user_id
    GROUP BY wl.exercise_id
  ),
  exercise_stats AS (
    SELECT 
      wl.exercise_id,
      COUNT(DISTINCT wl.id) as total_workouts,
      MAX(wl.logged_at) as last_workout_date
    FROM workout_logs wl
    WHERE wl.user_id = p_user_id
    GROUP BY wl.exercise_id
  )
  SELECT 
    epr.exercise_id,
    e.name as exercise_name,
    COALESCE(epr.max_weight, 0)::DECIMAL as pr_weight,
    epr.pr_date,
    COALESCE(est.total_workouts, 0)::INTEGER as total_workouts,
    est.last_workout_date
  FROM exercise_prs epr
  JOIN exercises e ON e.id = epr.exercise_id
  LEFT JOIN exercise_stats est ON est.exercise_id = epr.exercise_id
  ORDER BY epr.max_weight DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

