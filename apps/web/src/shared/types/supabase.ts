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
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          title: string
          is_done: boolean
          priority: "high" | "medium" | "low"
          due_date: string | null
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          title: string
          is_done?: boolean
          priority?: "high" | "medium" | "low"
          due_date?: string | null
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          title?: string
          is_done?: boolean
          priority?: "high" | "medium" | "low"
          due_date?: string | null
          position?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
