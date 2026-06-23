"use client"

import { Trash2 } from "lucide-react"
import { Header } from "@/widgets/header/ui/Header"
import { CreateCategoryForm } from "@/features/category-create/ui/CreateCategoryForm"
import { Button } from "@/shared/ui/button"
import { useCategoryStore } from "@/entities/category/model/useCategoryStore"
import { useTodoStore } from "@/entities/todo/model/useTodoStore"
import { useToast } from "@/shared/lib/use-toast"
import { deleteCategory } from "@/features/category-delete/api/deleteCategory"
import { CategoryBadge } from "@/entities/category/ui/CategoryBadge"

export function CategoryManagerPage() {
  const { categories, removeCategory } = useCategoryStore()
  const { updateTodo, todos } = useTodoStore()
  const { toast } = useToast()

  async function handleDelete(id: string) {
    // 낙관적: 카테고리 제거 + 연결된 투두들의 category_id → null
    removeCategory(id)
    todos.forEach((t) => {
      if (t.category_id === id) updateTodo(t.id, { category_id: null })
    })

    const result = await deleteCategory(id)
    if (result.error) {
      toast({
        title: "카테고리 삭제 실패",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1200px] mx-auto px-6 py-6 space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground mb-4">카테고리 관리</h1>
          <div className="max-w-sm">
            <CreateCategoryForm />
          </div>
        </div>

        {categories.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              카테고리 목록
            </h2>
            <div className="space-y-2">
              {categories.map((category) => {
                const todoCount = todos.filter((t) => t.category_id === category.id).length
                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-md border border-border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <CategoryBadge category={category} />
                      <span className="text-xs text-muted-foreground">
                        {todoCount}개 투두
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
