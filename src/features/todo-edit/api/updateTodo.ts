"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/shared/api/supabaseServer"
import type { UpdateTodoInput, Todo } from "@/entities/todo/model/types"

/**
 * 기존 투두를 업데이트합니다.
 * @param id - 투두 ID
 * @param input - 변경할 필드
 * @returns 업데이트된 투두 또는 오류
 */
export async function updateTodo(
  id: string,
  input: UpdateTodoInput
): Promise<{ data: Todo | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("todos")
    .update(input)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/")
  return { data: data as Todo, error: null }
}
