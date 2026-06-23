export type Priority = "high" | "medium" | "low"

export interface Todo {
  id: string
  user_id: string
  category_id: string | null
  title: string
  is_done: boolean
  priority: Priority
  due_date: string | null
  position: number
  created_at: string
}

export interface CreateTodoInput {
  title: string
  priority?: Priority
  category_id?: string | null
  due_date?: string | null
  created_at?: string
}

export interface UpdateTodoInput {
  title?: string
  priority?: Priority
  category_id?: string | null
  due_date?: string | null
  is_done?: boolean
  position?: number
}
