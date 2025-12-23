"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface UserProgressMetrics {
  user_id: string
  user_name: string
  user_email: string | null
  total_pr_weight: number
  total_exercises_with_pr: number
  total_volume: number
  recent_volume: number
  pr_count: number
}

export interface ExerciseProgress {
  exercise_id: string
  exercise_name: string
  pr_weight: number
  pr_date: string | null
  total_workouts: number
  last_workout_date: string | null
}

export interface ProgressionRanking {
  user_id: string
  user_name: string
  user_email: string | null
  total_progression_percentage: number
  average_progression_percentage: number
  exercises_with_progression: number
  total_pr_weight: number
  first_total_weight: number
}

export interface WeightProgression {
  date: string
  max_weight: number
  exercise_id: string
  exercise_name: string
}

export function useDashboardRanking() {
  const supabase = createClient()

  const { data: ranking = [], isLoading, error } = useQuery({
    queryKey: ["dashboard-ranking"],
    queryFn: async () => {
      const { data, error: rpcError } = await supabase.rpc("get_user_progress_metrics")

      if (rpcError) throw rpcError
      return (data || []) as UserProgressMetrics[]
    },
  })

  return { ranking, isLoading, error }
}

export function useUserExerciseProgress(userId?: string) {
  const supabase = createClient()

  const { data: progress = [], isLoading, error } = useQuery({
    queryKey: ["user-exercise-progress", userId],
    queryFn: async () => {
      if (!userId) return []

      const { data, error: rpcError } = await supabase.rpc(
        "get_user_exercise_progress",
        { p_user_id: userId }
      )

      if (rpcError) throw rpcError
      return (data || []) as ExerciseProgress[]
    },
    enabled: !!userId,
  })

  return { progress, isLoading, error }
}

export function useProgressionRanking() {
  const supabase = createClient()

  const { data: ranking = [], isLoading, error } = useQuery({
    queryKey: ["progression-ranking"],
    queryFn: async () => {
      const { data, error: rpcError } = await supabase.rpc("get_progression_ranking")

      if (rpcError) throw rpcError
      return (data || []) as ProgressionRanking[]
    },
  })

  return { ranking, isLoading, error }
}

export function useWeightProgression(userId?: string, exerciseId?: string) {
  const supabase = createClient()

  const { data: progression = [], isLoading, error } = useQuery({
    queryKey: ["weight-progression", userId, exerciseId],
    queryFn: async () => {
      if (!userId) return []

      const { data, error: rpcError } = await supabase.rpc("get_weight_progression", {
        p_user_id: userId,
        p_exercise_id: exerciseId || null,
      })

      if (rpcError) throw rpcError
      return (data || []) as WeightProgression[]
    },
    enabled: !!userId,
  })

  return { progression, isLoading, error }
}

