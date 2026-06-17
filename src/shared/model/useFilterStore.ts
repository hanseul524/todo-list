"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

type SortBy = "created_at" | "due_date" | "priority" | "position"
type FilterBy = "all" | "done" | "undone"

interface FilterStore {
  searchQuery: string
  selectedCategory: string | null
  sortBy: SortBy
  filterBy: FilterBy
  setSearchQuery: (q: string) => void
  setSelectedCategory: (id: string | null) => void
  setSortBy: (sort: SortBy) => void
  setFilterBy: (filter: FilterBy) => void
}

// @MX:ANCHOR: [AUTO] FilterStore — 필터 상태의 중앙 허브, 3개 이상 UI 컴포넌트에서 참조
// @MX:REASON: todo-filter/ui, widgets/header, pages/todo-list 등 다수 슬라이스가 이 스토어를 구독
export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      searchQuery: "",
      selectedCategory: null,
      sortBy: "created_at",
      filterBy: "all",
      setSearchQuery: (q) => set({ searchQuery: q }),
      setSelectedCategory: (id) => set({ selectedCategory: id }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setFilterBy: (filter) => set({ filterBy: filter }),
    }),
    {
      name: "todo-filter-storage",
    }
  )
)
