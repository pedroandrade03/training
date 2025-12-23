"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface User {
  id: string
  email: string | null
  name: string | null
  avatar_url: string | null
  is_admin: boolean
}

export function useUsers() {
  const supabase = createClient()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      // Check if user is admin first
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      if (!user) return []

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()

      // Only admins can see all users
      if (!profile?.is_admin) {
        return []
      }

      // Use RPC function to get all profiles (bypasses RLS)
      const { data, error } = await supabase.rpc("get_all_profiles")

      if (error) throw error
      return (data || []) as User[]
    },
  })

  return {
    users,
    isLoading,
  }
}

