"use client"

import { create } from "zustand"
import type { Category } from "./types"

interface CategoryStore {
  categories: Category[]
  setCategories: (categories: Category[]) => void
  addCategory: (category: Category) => void
  removeCategory: (id: string) => void
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),
  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),
}))
