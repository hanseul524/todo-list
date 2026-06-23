import { createClient } from "@/shared/api/supabaseServer"
import { CategoryManagerPage } from "@/pages/category-manager/ui/CategoryManagerPage"
import { StoreInitializer } from "../StoreInitializer"
import type { Todo } from "@/entities/todo/model/types"
import type { Category } from "@/entities/category/model/types"

export default async function CategoriesPage() {
  const supabase = await createClient()

  const [{ data: todos }, { data: categories }] = await Promise.all([
    supabase.from("todos").select("*"),
    supabase.from("categories").select("*").order("created_at", { ascending: true }),
  ])

  return (
    <>
      <StoreInitializer
        todos={(todos as Todo[]) ?? []}
        categories={(categories as Category[]) ?? []}
      />
      <CategoryManagerPage />
    </>
  )
}
