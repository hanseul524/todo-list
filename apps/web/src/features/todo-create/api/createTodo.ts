"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/shared/api/supabaseServer"
import type { CreateTodoInput, Todo } from "@/entities/todo/model/types"

/**
 * 새 투두를 생성합니다.
 * @param input - 제목, 우선순위, 카테고리 ID, 마감일
 * @returns 생성된 투두 또는 오류
 */
export async function createTodo(
  input: CreateTodoInput
): Promise<{ data: Todo | null; error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "인증이 필요합니다" }
  }

  // 현재 최대 position 조회
  const { data: maxPositionData } = await supabase
    .from("todos")
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1)

  const rows = maxPositionData as Array<{ position: number }> | null
  const nextPosition = rows && rows.length > 0 ? rows[0].position + 1 : 0

  const { data, error } = await supabase
    .from("todos")
    .insert({
      user_id: user.id,
      title: input.title,
      priority: input.priority ?? "medium",
      category_id: input.category_id ?? null,
      due_date: input.due_date ?? null,
      position: nextPosition,
      ...(input.created_at ? { created_at: input.created_at } : {}),
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/")
  return { data: data as Todo, error: null }
}
