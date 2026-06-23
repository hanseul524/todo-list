import { supabase } from "@/shared/api/supabase"
import type { UpdateTodoInput, Todo } from "@todo/types"

export async function updateTodo(id: string, input: UpdateTodoInput): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .update(input)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Todo
}
