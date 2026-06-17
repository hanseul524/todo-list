"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/shared/api/supabaseServer"

/**
 * 투두의 완료 상태를 토글합니다.
 * @param id - 투두 ID
 * @param isDone - 새로운 완료 상태
 */
export async function toggleTodo(
  id: string,
  isDone: boolean
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("todos")
    .update({ is_done: isDone })
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { error: null }
}
