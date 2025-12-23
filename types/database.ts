export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          avatar_url: string | null
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          suggested_reps: string
          category: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          suggested_reps: string
          category?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          suggested_reps?: string
          category?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      workout_sets: {
        Row: {
          id: string
          workout_log_id: string
          set_number: number
          weight: number
          reps: number
          assisted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          workout_log_id: string
          set_number: number
          weight: number
          reps: number
          assisted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          workout_log_id?: string
          set_number?: number
          weight?: number
          reps?: number
          assisted?: boolean
          created_at?: string
        }
      }
      workout_logs: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          weight: number
          reps: number
          logged_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          weight: number
          reps: number
          logged_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          weight?: number
          reps?: number
          logged_at?: string
        }
      }
      exercise_assignments: {
        Row: {
          id: string
          exercise_id: string
          user_id: string
          assigned_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          exercise_id: string
          user_id: string
          assigned_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          exercise_id?: string
          user_id?: string
          assigned_by?: string | null
          created_at?: string
        }
      }
      exercise_preferences: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          is_hidden: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          is_hidden?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          is_hidden?: boolean
          created_at?: string
        }
      }
    }
  }
}

