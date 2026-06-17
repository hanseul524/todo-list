"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/shared/api/supabaseServer"

/**
 * 투두 목록의 position을 일괄 업데이트합니다 (드래그 앤 드롭 후 호출).
 * @param orderedIds - 새 순서의 투두 ID 배열 (0부터 인덱스 = position)
 */
// @MX:WARN: [AUTO] Promise.all로 다수의 DB 업데이트를 병렬 실행 — 부분 실패 가능성 있음
// @MX:REASON: 개별 항목 업데이트 실패 시 일부만 반영될 수 있으므로, 오류 처리 후 클라이언트 롤백 필요
export async function reorderTodos(
  orderedIds: string[]
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const updates = orderedIds.map((id, index) =>
    supabase.from("todos").update({ position: index }).eq("id", id)
  )

  const results = await Promise.all(updates)
  const firstError = results.find((r) => r.error)

  if (firstError?.error) {
    return { error: firstError.error.message }
  }

  revalidatePath("/")
  return { error: null }
}
