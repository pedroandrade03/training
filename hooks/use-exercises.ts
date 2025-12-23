"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface Category {
  id: string
  name: string
}

export interface Exercise {
  id: string
  name: string
  suggested_reps: string
  // category is deprecated but kept for compatibility with UI that hasn't been updated yet
  // logic should prioritize `categories`
  category: string | null 
  categories: Category[]
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

export function useCategories() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name")
      
      if (error) throw error
      return data as Category[]
    }
  })
}

export function useExercises() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Hook to get detailed exercise data (with categories and assignments)
  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return []

      // Call the RPC function that returns exercises with joined categories and assignments
      const { data, error } = await supabase.rpc("get_exercises_with_categories")

      if (error) throw error

      // Transform RPC result to Exercise type
      // RPC returns JSON for categories, we need to cast it
      let exercisesData = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        suggested_reps: row.suggested_reps,
        created_by: row.created_by,
        created_at: row.created_at,
        category: null, // Deprecated
        categories: row.categories || [],
        assigned_user_ids: row.assigned_user_ids || [], // Raw IDs from RPC
        exercise_assignments: (row.assigned_user_ids || []).map((uid: string) => ({ user_id: uid }))
      }))

      // Check if user is admin
      const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single()
      const isAdmin = profile?.is_admin ?? false

      // Filtering logic
      if (!isAdmin) {
        // Filter: show if user is assigned OR exercise has NO assignments
        exercisesData = exercisesData.filter((exercise: any) => {
          const userIsAssigned = exercise.assigned_user_ids.includes(user.id)
          const hasAssignments = exercise.assigned_user_ids.length > 0
          
          return userIsAssigned || !hasAssignments
        })
      } else {
        // For admin: Enrich with profile data for assignments
        const userIds = new Set<string>()
        exercisesData.forEach((exercise: any) => {
          exercise.assigned_user_ids.forEach((uid: string) => userIds.add(uid))
        })

        let profilesMap: Record<string, { name: string | null; email: string | null }> = {}
        if (userIds.size > 0) {
          // Use RPC or unrestricted query if policy allows
          // Since we fixed profile policy, we can query profiles
          const { data: profilesData } = await supabase.rpc("get_all_profiles") // Use RPC to be safe
          
          if (profilesData) {
            profilesMap = profilesData.reduce((acc: any, profile: any) => {
              acc[profile.id] = { name: profile.name, email: profile.email }
              return acc
            }, {})
          }
        }

        // Map profiles to assignments
        exercisesData = exercisesData.map((exercise: any) => ({
          ...exercise,
          exercise_assignments: exercise.assigned_user_ids.map((uid: string) => ({
            user_id: uid,
            profiles: profilesMap[uid] || null
          }))
        }))
      }

      return exercisesData as Exercise[]
    },
    enabled: true
  })

  const createMutation = useMutation({
    mutationFn: async (exercise: { 
      name: string
      suggested_reps: string
      category_ids?: string[] // Changed from category string
      assigned_user_ids?: string[]
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // 1. Create exercise
      const { data: exerciseData, error: exerciseError } = await supabase
        .from("exercises")
        .insert({
          name: exercise.name,
          suggested_reps: exercise.suggested_reps,
          created_by: user.id,
        })
        .select()
        .single()

      if (exerciseError) throw exerciseError

      // 2. Create category associations
      if (exercise.category_ids && exercise.category_ids.length > 0) {
        const catAssociations = exercise.category_ids.map(catId => ({
          exercise_id: exerciseData.id,
          category_id: catId
        }))
        
        const { error: catError } = await supabase
          .from("exercise_categories")
          .insert(catAssociations)
        
        if (catError) throw catError
      }

      // 3. Create assignments
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

      return exerciseData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      assigned_user_ids,
      category_ids,
      ...updates
    }: {
      id: string
      name?: string
      suggested_reps?: string
      category_ids?: string[]
      assigned_user_ids?: string[]
    }) => {
      // 1. Update exercise fields
      const { data, error } = await supabase
        .from("exercises")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      // 2. Update categories if provided
      if (category_ids !== undefined) {
         // Delete existing
         await supabase.from("exercise_categories").delete().eq("exercise_id", id)
         
         // Insert new
         if (category_ids.length > 0) {
            const catAssociations = category_ids.map(catId => ({
              exercise_id: id,
              category_id: catId
            }))
            await supabase.from("exercise_categories").insert(catAssociations)
         }
      }

      // 3. Update assignments if provided
      if (assigned_user_ids !== undefined) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("Not authenticated")

        await supabase.from("exercise_assignments").delete().eq("exercise_id", id)

        if (assigned_user_ids.length > 0) {
          const assignments = assigned_user_ids.map((userId) => ({
            exercise_id: id,
            user_id: userId,
            assigned_by: user.id,
          }))

          await supabase.from("exercise_assignments").insert(assignments)
        }
      }

      return data
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

  // Category management
  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("categories").insert({ name })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    }
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    }
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

  return {
    exercises,
    isLoading,
    createExercise: createMutation.mutateAsync,
    updateExercise: updateMutation.mutateAsync,
    deleteExercise: deleteMutation.mutateAsync,
    createCategory: createCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    updateAssignments: updateAssignmentsMutation.mutateAsync,
  }
}
