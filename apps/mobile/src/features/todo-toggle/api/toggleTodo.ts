import { supabase } from "@/shared/api/supabase"

export async function toggleTodo(id: string, isDone: boolean): Promise<void> {
  const { error } = await supabase
    .from("todos")
    .update({ is_done: isDone })
    .eq("id", id)

  if (error) throw error
}
