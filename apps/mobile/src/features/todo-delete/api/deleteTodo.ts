import { supabase } from "@/shared/api/supabase"

export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase.from("todos").delete().eq("id", id)
  if (error) throw error
}
