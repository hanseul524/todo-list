"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/shared/api/supabaseServer"

/**
 * 투두를 삭제합니다.
 * @param id - 삭제할 투두 ID
 */
export async function deleteTodo(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase.from("todos").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { error: null }
}
