"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/shared/api/supabaseServer"

/**
 * 카테고리를 삭제합니다.
 * 연결된 투두의 category_id는 ON DELETE SET NULL로 자동 처리됩니다.
 * @param id - 삭제할 카테고리 ID
 */
export async function deleteCategory(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase.from("categories").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { error: null }
}
