"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { useFilterStore } from "@/shared/model/useFilterStore"
import { useCategoryStore } from "@/entities/category/model/useCategoryStore"

export function TodoFilter() {
  const { sortBy, setSortBy, filterBy, setFilterBy, selectedCategory, setSelectedCategory } =
    useFilterStore()
  const { categories } = useCategoryStore()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={filterBy} onValueChange={(v) => setFilterBy(v as "all" | "done" | "undone")}>
        <SelectTrigger className="h-8 w-28 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          <SelectItem value="undone">미완료</SelectItem>
          <SelectItem value="done">완료</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at">최신순</SelectItem>
          <SelectItem value="due_date">마감일순</SelectItem>
          <SelectItem value="priority">우선순위</SelectItem>
          <SelectItem value="position">수동 정렬</SelectItem>
        </SelectContent>
      </Select>

      {categories.length > 0 && (
        <Select
          value={selectedCategory ?? ""}
          onValueChange={(v) => setSelectedCategory(v || null)}
        >
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">전체</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
