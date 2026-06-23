import { supabase } from "@/shared/api/supabase"
import type { CreateCategoryInput, Category } from "@todo/types"

export async function createCategory(
  input: CreateCategoryInput & { user_id: string }
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: input.name,
      color: input.color,
      user_id: input.user_id,
    })
    .select()
    .single()

  if (error) throw error
  return data as Category
}
