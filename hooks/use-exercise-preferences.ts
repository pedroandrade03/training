"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

// Table to store user preferences for exercises (which exercises they want to see)
// This allows users to hide/show exercises that are available to all

export interface ExercisePreference {
  id: string
  user_id: string
  exercise_id: string
  is_hidden: boolean
  created_at: string
}

export function useExercisePreferences() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: preferences = [], isLoading } = useQuery({
    queryKey: ["exercise_preferences"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      if (!user) return []

      const { data, error } = await supabase
        .from("exercise_preferences")
        .select("*")
        .eq("user_id", user.id)

      if (error) throw error
      return data as ExercisePreference[]
    },
  })

  const togglePreferenceMutation = useMutation({
    mutationFn: async ({
      exercise_id,
      is_hidden,
    }: {
      exercise_id: string
      is_hidden: boolean
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      if (!user) throw new Error("Not authenticated")

      // Check if preference exists
      const { data: existing } = await supabase
        .from("exercise_preferences")
        .select("id")
        .eq("user_id", user.id)
        .eq("exercise_id", exercise_id)
        .single()

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("exercise_preferences")
          .update({ is_hidden })
          .eq("id", existing.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from("exercise_preferences")
          .insert({
            user_id: user.id,
            exercise_id,
            is_hidden,
          })

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercise_preferences"] })
      queryClient.invalidateQueries({ queryKey: ["exercises"] })
    },
  })

  const isHidden = (exerciseId: string): boolean => {
    const preference = preferences.find((p) => p.exercise_id === exerciseId)
    return preference?.is_hidden ?? false
  }

  const toggleHide = async (exerciseId: string, hide: boolean) => {
    await togglePreferenceMutation.mutateAsync({
      exercise_id: exerciseId,
      is_hidden: hide,
    })
  }

  return {
    preferences,
    isLoading,
    isHidden,
    toggleHide,
  }
}

