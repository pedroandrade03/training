"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface Exercise {
  id: string
  name: string
  suggested_reps: string
  category: string | null
  created_by: string | null
  created_at: string
  exercise_assignments?: Array<{
    user_id: string
    profiles?: {
      name: string | null
      email: string | null
    }
  }>
}

export const EXERCISE_CATEGORIES = [
  { value: "push", label: "Push" },
  { value: "pull", label: "Pull" },
  { value: "legs", label: "Legs" },
  { value: "upper", label: "Upper" },
  { value: "lower", label: "Lower" },
] as const

export type ExerciseCategory = typeof EXERCISE_CATEGORIES[number]["value"] | null

export function useExercises() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Check if user is admin
      let isAdmin = false
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single()
        isAdmin = profile?.is_admin ?? false
      }

      // Fetch exercises
      let exercisesData: any[]
      
      if (isAdmin) {
        // Admins can see everything with full assignment details
        const { data, error } = await supabase
          .from("exercises")
          .select("*, exercise_assignments(user_id)")
          .order("name", { ascending: true })

        if (error) throw error
        exercisesData = data || []
      } else {
        // For regular users: get all exercises first
        const { data: allExercises, error: exercisesError } = await supabase
          .from("exercises")
          .select("*")
          .order("name", { ascending: true })

        if (exercisesError) throw exercisesError

        // Get user's assigned exercise IDs
        const { data: userAssignments } = await supabase
          .from("exercise_assignments")
          .select("exercise_id")
          .eq("user_id", user!.id)

        const assignedExerciseIds = new Set(
          userAssignments?.map((a) => String(a.exercise_id)) || []
        )

        // Get all exercise IDs that have ANY assignments using RPC function
        // This function bypasses RLS to get accurate data
        let exercisesWithAssignments = new Set<string>()
        
        try {
          const { data: rpcResult, error: rpcError } = await supabase.rpc("get_exercises_with_assignments")
          
          if (rpcError) {
            console.error("Error calling get_exercises_with_assignments:", rpcError)
            // If RPC fails, we need to be restrictive for security
            // Only show exercises that user is assigned to
            exercisesData = (allExercises || []).filter((exercise: any) => {
              return assignedExerciseIds.has(exercise.id)
            })
            
            // Add assignment info
            exercisesData = exercisesData.map((exercise: any) => ({
              ...exercise,
              exercise_assignments: [{ user_id: user!.id }],
            }))
            
            return exercisesData as Exercise[]
          }
          
          if (rpcResult && Array.isArray(rpcResult)) {
            rpcResult.forEach((row: any) => {
              // Handle both object format {exercise_id: ...} and direct UUID
              const exerciseId = row.exercise_id || row
              if (exerciseId) {
                exercisesWithAssignments.add(String(exerciseId))
              }
            })
          } else if (rpcResult) {
            // Handle case where result might be a single value or different format
            console.warn("Unexpected RPC result format:", rpcResult)
          }
          
          // Debug: log what we found
          if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            console.log('Exercises with assignments:', Array.from(exercisesWithAssignments))
            console.log('User assigned exercises:', Array.from(assignedExerciseIds))
          }
        } catch (error) {
          console.error("Error in get_exercises_with_assignments:", error)
          // If RPC fails completely, be restrictive - only show assigned exercises
          exercisesData = (allExercises || []).filter((exercise: any) => {
            return assignedExerciseIds.has(String(exercise.id))
          })
          
          exercisesData = exercisesData.map((exercise: any) => ({
            ...exercise,
            exercise_assignments: [{ user_id: user!.id }],
          }))
          
          return exercisesData as Exercise[]
        }

        // Filter: show if user is assigned OR exercise has NO assignments
        exercisesData = (allExercises || []).filter((exercise: any) => {
          const exerciseId = String(exercise.id)
          
          // User is assigned - always show
          if (assignedExerciseIds.has(exerciseId)) {
            return true
          }
          
          // Exercise has assignments but user is NOT assigned - HIDE IT
          if (exercisesWithAssignments.has(exerciseId)) {
            return false
          }
          
          // Exercise has NO assignments - available to all, show it
          // (not in exercisesWithAssignments set means no one is assigned)
          return true
        })
        
        // Debug log (remove in production)
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.log('Filtered exercises:', {
            total: allExercises?.length || 0,
            filtered: exercisesData.length,
            userAssigned: assignedExerciseIds.size,
            exercisesWithAssignments: exercisesWithAssignments.size,
            allExerciseIds: allExercises?.map((e: any) => e.id),
            exercisesWithAssignmentsList: Array.from(exercisesWithAssignments),
            userAssignedList: Array.from(assignedExerciseIds),
          })
        }

        // Add minimal assignment info
        exercisesData = exercisesData.map((exercise: any) => ({
          ...exercise,
          exercise_assignments: assignedExerciseIds.has(String(exercise.id)) 
            ? [{ user_id: user!.id }] 
            : [],
        }))
      }

      // Fetch user profiles for assignments (for admin view)
      if (isAdmin) {
        const userIds = new Set<string>()
        exercisesData?.forEach((exercise: any) => {
          exercise.exercise_assignments?.forEach((assignment: any) => {
            userIds.add(assignment.user_id)
          })
        })

        let profilesMap: Record<string, { name: string | null; email: string | null }> = {}
        if (userIds.size > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, name, email")
            .in("id", Array.from(userIds))

          if (profilesData) {
            profilesMap = profilesData.reduce((acc, profile) => {
              acc[profile.id] = { name: profile.name, email: profile.email }
              return acc
            }, {} as Record<string, { name: string | null; email: string | null }>)
          }
        }

        // Enrich exercises with profile data
        exercisesData = exercisesData?.map((exercise: any) => ({
          ...exercise,
          exercise_assignments: exercise.exercise_assignments?.map((assignment: any) => ({
            ...assignment,
            profiles: profilesMap[assignment.user_id] || null,
          })),
        })) || []
      }


      return exercisesData as Exercise[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async (exercise: { 
      name: string
      suggested_reps: string
      category?: string | null
      assigned_user_ids?: string[]
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Create exercise
      const { data: exerciseData, error: exerciseError } = await supabase
        .from("exercises")
        .insert({
          name: exercise.name,
          suggested_reps: exercise.suggested_reps,
          category: exercise.category || null,
          created_by: user.id,
        })
        .select()
        .single()

      if (exerciseError) throw exerciseError

      // Create assignments if provided
      if (exercise.assigned_user_ids && exercise.assigned_user_ids.length > 0) {
        const assignments = exercise.assigned_user_ids.map((userId) => ({
          exercise_id: exerciseData.id,
          user_id: userId,
          assigned_by: user.id,
        }))

        const { error: assignmentError } = await supabase
          .from("exercise_assignments")
          .insert(assignments)

        if (assignmentError) throw assignmentError
      }

      return exerciseData as Exercise
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] })
    },
  })

  const updateAssignmentsMutation = useMutation({
    mutationFn: async ({
      exercise_id,
      assigned_user_ids,
    }: {
      exercise_id: string
      assigned_user_ids: string[]
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from("exercise_assignments")
        .delete()
        .eq("exercise_id", exercise_id)

      if (deleteError) throw deleteError

      // Create new assignments
      if (assigned_user_ids.length > 0) {
        const assignments = assigned_user_ids.map((userId) => ({
          exercise_id,
          user_id: userId,
          assigned_by: user.id,
        }))

        const { error: insertError } = await supabase
          .from("exercise_assignments")
          .insert(assignments)

        if (insertError) throw insertError
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      assigned_user_ids,
      ...updates
    }: {
      id: string
      name?: string
      suggested_reps?: string
      category?: string | null
      assigned_user_ids?: string[]
    }) => {
      // Update exercise
      const { data, error } = await supabase
        .from("exercises")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      // Update assignments if provided
      if (assigned_user_ids !== undefined) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("Not authenticated")

        // Delete existing assignments
        const { error: deleteError } = await supabase
          .from("exercise_assignments")
          .delete()
          .eq("exercise_id", id)

        if (deleteError) throw deleteError

        // Create new assignments
        if (assigned_user_ids.length > 0) {
          const assignments = assigned_user_ids.map((userId) => ({
            exercise_id: id,
            user_id: userId,
            assigned_by: user.id,
          }))

          const { error: insertError } = await supabase
            .from("exercise_assignments")
            .insert(assignments)

          if (insertError) throw insertError
        }
      }

      return data as Exercise
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("exercises").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] })
    },
  })

  return {
    exercises,
    isLoading,
    createExercise: createMutation.mutateAsync,
    updateExercise: updateMutation.mutateAsync,
    deleteExercise: deleteMutation.mutateAsync,
    updateAssignments: updateAssignmentsMutation.mutateAsync,
  }
}

