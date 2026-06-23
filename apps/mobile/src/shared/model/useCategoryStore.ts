import { create } from "zustand"
import type { Category } from "@todo/types"

interface CategoryStore {
  categories: Category[]
  setCategories: (categories: Category[]) => void
  addCategory: (category: Category) => void
  deleteCategory: (id: string) => void
}

// @MX:ANCHOR: [AUTO] Category store - central category state, fan_in >= 3
// @MX:REASON: Used by widgets, category create/delete features, todo forms
export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),
  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),
}))
