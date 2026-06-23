import { supabase } from "@/shared/api/supabase"
import type { CreateTodoInput, Todo } from "@todo/types"

export async function createTodo(
  input: CreateTodoInput & { user_id: string }
): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .insert({
      title: input.title,
      priority: input.priority ?? "medium",
      category_id: input.category_id ?? null,
      due_date: input.due_date ?? null,
      created_at: input.created_at ?? new Date().toISOString(),
      user_id: input.user_id,
      position: 0,
      is_done: false,
    })
    .select()
    .single()

  if (error) throw error
  return data as Todo
}
