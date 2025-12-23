"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface Category {
  id: string
  name: string
}

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

