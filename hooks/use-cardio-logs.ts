"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface CardioLog {
  id: string
  workout_log_id: string
  duration_minutes: number
  speed: number | null
  resistance: number | null
  incline: number | null
  created_at: string
  workout_logs?: {
    logged_at: string
    exercises?: {
      name: string
    }
  }
}

export function useCardioLogs(exerciseId?: string) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["cardio_logs", exerciseId],
    queryFn: async () => {
      // Get all cardio logs with workout_logs
      let query = supabase
        .from("cardio_logs")
        .select("*, workout_logs!inner(id, logged_at, exercise_id, exercises(name))")
        .order("created_at", { ascending: false })

      if (exerciseId) {
        // Filter by exercise_id in the workout_logs join
        query = query.eq("workout_logs.exercise_id", exerciseId)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as CardioLog[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async (log: {
      exercise_id: string
      duration_minutes: number
      speed?: number | null
      resistance?: number | null
      incline?: number | null
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Create workout_log (with weight=0, reps=0 for compatibility)
      const { data: workoutLog, error: logError } = await supabase
        .from("workout_logs")
        .insert({
          user_id: user.id,
          exercise_id: log.exercise_id,
          weight: 0,
          reps: 0,
        })
        .select()
        .single()

      if (logError) throw logError

      // Create cardio_log
      const { data: cardioLog, error: cardioError } = await supabase
        .from("cardio_logs")
        .insert({
          workout_log_id: workoutLog.id,
          duration_minutes: log.duration_minutes,
          speed: log.speed || null,
          resistance: log.resistance || null,
          incline: log.incline || null,
        })
        .select("*, workout_logs(logged_at, exercises(name))")
        .single()

      if (cardioError) throw cardioError
      return cardioLog as CardioLog
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardio_logs"] })
      queryClient.invalidateQueries({ queryKey: ["workout_logs"] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      duration_minutes,
      speed,
      resistance,
      incline,
    }: {
      id: string
      duration_minutes?: number
      speed?: number | null
      resistance?: number | null
      incline?: number | null
    }) => {
      const updates: any = {}
      if (duration_minutes !== undefined) updates.duration_minutes = duration_minutes
      if (speed !== undefined) updates.speed = speed
      if (resistance !== undefined) updates.resistance = resistance
      if (incline !== undefined) updates.incline = incline

      const { data, error } = await supabase
        .from("cardio_logs")
        .update(updates)
        .eq("id", id)
        .select("*, workout_logs(logged_at, exercises(name))")
        .single()

      if (error) throw error
      return data as CardioLog
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardio_logs"] })
      queryClient.invalidateQueries({ queryKey: ["workout_logs"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Get workout_log_id first
      const { data: cardioLog } = await supabase
        .from("cardio_logs")
        .select("workout_log_id")
        .eq("id", id)
        .single()

      if (!cardioLog) throw new Error("Cardio log not found")

      // Delete workout_log (cascade will delete cardio_log)
      const { error } = await supabase
        .from("workout_logs")
        .delete()
        .eq("id", cardioLog.workout_log_id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardio_logs"] })
      queryClient.invalidateQueries({ queryKey: ["workout_logs"] })
    },
  })

  return {
    logs,
    isLoading,
    createCardioLog: createMutation.mutateAsync,
    updateCardioLog: updateMutation.mutateAsync,
    deleteCardioLog: deleteMutation.mutateAsync,
  }
}

