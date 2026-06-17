"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/shared/api/supabaseServer"
import type { Category, CreateCategoryInput } from "@/entities/category/model/types"

/**
 * 새 카테고리를 생성합니다.
 * @param input - 카테고리 이름과 색상
 * @returns 생성된 카테고리 또는 오류
 */
export async function createCategory(
  input: CreateCategoryInput
): Promise<{ data: Category | null; error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "인증이 필요합니다" }
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ user_id: user.id, name: input.name, color: input.color })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/")
  return { data: data as Category, error: null }
}
