"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface WorkoutSet {
  id: string
  workout_log_id: string
  set_number: number
  weight: number
  reps: number
  assisted: boolean
  created_at: string
}

export interface WorkoutLog {
  id: string
  user_id: string
  exercise_id: string
  weight: number
  reps: number
  logged_at: string
  exercises?: {
    name: string
  }
  workout_sets?: WorkoutSet[]
}

export function useWorkoutLogs(exerciseId?: string) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["workout_logs", exerciseId],
    queryFn: async () => {
      let query = supabase
        .from("workout_logs")
        .select("*, exercises(name), workout_sets(*)")
        .order("logged_at", { ascending: false })

      if (exerciseId) {
        query = query.eq("exercise_id", exerciseId)
      }

      const { data, error } = await query

      if (error) throw error
      return data as WorkoutLog[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async (log: {
      exercise_id: string
      sets: Array<{
        set_number: number
        weight: number
        reps: number
        assisted: boolean
      }>
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Calculate average weight and total reps for backward compatibility
      const avgWeight = log.sets.reduce((sum, set) => sum + set.weight, 0) / log.sets.length
      const totalReps = log.sets.reduce((sum, set) => sum + set.reps, 0)

      // Create workout log
      const { data: workoutLog, error: logError } = await supabase
        .from("workout_logs")
        .insert({
          user_id: user.id,
          exercise_id: log.exercise_id,
          weight: avgWeight, // Keep for backward compatibility
          reps: totalReps, // Keep for backward compatibility
        })
        .select()
        .single()

      if (logError) throw logError

      // Create workout sets
      const setsToInsert = log.sets.map((set) => ({
        workout_log_id: workoutLog.id,
        set_number: set.set_number,
        weight: set.weight,
        reps: set.reps,
        assisted: set.assisted,
      }))

      const { error: setsError } = await supabase
        .from("workout_sets")
        .insert(setsToInsert)

      if (setsError) throw setsError

      // Fetch the complete log with sets
      const { data: completeLog, error: fetchError } = await supabase
        .from("workout_logs")
        .select("*, workout_sets(*)")
        .eq("id", workoutLog.id)
        .single()

      if (fetchError) throw fetchError
      return completeLog as WorkoutLog
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout_logs"] })
    },
  })

  // Calculate PR (Personal Record) - highest weight for an exercise
  // Checks both old format (weight in log) and new format (weight in sets)
  const getPR = (exerciseId: string): number | null => {
    const exerciseLogs = logs.filter((log) => log.exercise_id === exerciseId)
    if (exerciseLogs.length === 0) return null
    
    const allWeights: number[] = []
    
    exerciseLogs.forEach((log) => {
      if (log.workout_sets && log.workout_sets.length > 0) {
        // New format: get max weight from sets
        const maxSetWeight = Math.max(...log.workout_sets.map((set) => set.weight))
        allWeights.push(maxSetWeight)
      } else {
        // Old format: use weight from log
        allWeights.push(log.weight)
      }
    })
    
    return Math.max(...allWeights)
  }

  // Get last workout for an exercise
  const getLastWorkout = (exerciseId: string): {
    sets: Array<{ weight: number; reps: number; assisted: boolean }>
    hasAssisted: boolean
  } | null => {
    const exerciseLogs = logs.filter((log) => log.exercise_id === exerciseId)
    if (exerciseLogs.length === 0) return null

    // Get the most recent log (already sorted by logged_at desc)
    const lastLog = exerciseLogs[0]

    if (lastLog.workout_sets && lastLog.workout_sets.length > 0) {
      // New format: use sets
      const sets = lastLog.workout_sets
        .sort((a, b) => a.set_number - b.set_number)
        .map((set) => ({
          weight: set.weight,
          reps: set.reps,
          assisted: set.assisted,
        }))
      const hasAssisted = sets.some((set) => set.assisted)
      return { sets, hasAssisted }
    } else {
      // Old format: create a single set from log data
      return {
        sets: [{ weight: lastLog.weight, reps: lastLog.reps, assisted: false }],
        hasAssisted: false,
      }
    }
  }

  const updateMutation = useMutation({
    mutationFn: async ({
      logId,
      sets,
    }: {
      logId: string
      sets: Array<{
        set_number: number
        weight: number
        reps: number
        assisted: boolean
      }>
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Verify ownership
      const { data: existingLog } = await supabase
        .from("workout_logs")
        .select("user_id")
        .eq("id", logId)
        .single()

      if (!existingLog || existingLog.user_id !== user.id) {
        throw new Error("Not authorized to update this log")
      }

      // Calculate average weight and total reps for backward compatibility
      const avgWeight = sets.reduce((sum, set) => sum + set.weight, 0) / sets.length
      const totalReps = sets.reduce((sum, set) => sum + set.reps, 0)

      // Update workout log
      const { error: logError } = await supabase
        .from("workout_logs")
        .update({
          weight: avgWeight,
          reps: totalReps,
        })
        .eq("id", logId)

      if (logError) throw logError

      // Delete existing sets
      await supabase.from("workout_sets").delete().eq("workout_log_id", logId)

      // Create new sets
      const setsToInsert = sets.map((set) => ({
        workout_log_id: logId,
        set_number: set.set_number,
        weight: set.weight,
        reps: set.reps,
        assisted: set.assisted,
      }))

      const { error: setsError } = await supabase
        .from("workout_sets")
        .insert(setsToInsert)

      if (setsError) throw setsError

      // Fetch updated log
      const { data: updatedLog, error: fetchError } = await supabase
        .from("workout_logs")
        .select("*, workout_sets(*)")
        .eq("id", logId)
        .single()

      if (fetchError) throw fetchError
      return updatedLog as WorkoutLog
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout_logs"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (logId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Verify ownership
      const { data: existingLog } = await supabase
        .from("workout_logs")
        .select("user_id")
        .eq("id", logId)
        .single()

      if (!existingLog || existingLog.user_id !== user.id) {
        throw new Error("Not authorized to delete this log")
      }

      // Delete workout log (cascade will delete sets and cardio_logs)
      const { error } = await supabase.from("workout_logs").delete().eq("id", logId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout_logs"] })
    },
  })

  return {
    logs,
    isLoading,
    createLog: createMutation.mutateAsync,
    updateLog: updateMutation.mutateAsync,
    deleteLog: deleteMutation.mutateAsync,
    getPR,
    getLastWorkout,
  }
}

