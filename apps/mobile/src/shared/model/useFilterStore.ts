import { create } from "zustand"
import type { Priority } from "@todo/types"

type FilterBy = "all" | "done" | "undone" | Priority
type SortBy = "created_at" | "due_date" | "priority" | "position"

interface FilterStore {
  filterBy: FilterBy
  sortBy: SortBy
  searchQuery: string
  setFilterBy: (filterBy: FilterBy) => void
  setSortBy: (sortBy: SortBy) => void
  setSearchQuery: (query: string) => void
}

export const useFilterStore = create<FilterStore>((set) => ({
  filterBy: "all",
  sortBy: "created_at",
  searchQuery: "",
  setFilterBy: (filterBy) => set({ filterBy }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}))
