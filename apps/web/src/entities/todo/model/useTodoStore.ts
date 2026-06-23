"use client"

import { create } from "zustand"
import type { Todo } from "./types"

interface TodoStore {
  todos: Todo[]
  setTodos: (todos: Todo[]) => void
  addTodo: (todo: Todo) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  reorderTodos: (todos: Todo[]) => void
}

// @MX:ANCHOR: [AUTO] TodoStore — 투두 상태의 핵심 허브, features 레이어 전반에서 참조
// @MX:REASON: todo-create, todo-edit, todo-delete, todo-toggle, todo-reorder 등 5개 이상 feature 슬라이스가 이 스토어를 변경
export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  setTodos: (todos) => set({ todos }),
  addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] })),
  updateTodo: (id, updates) =>
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTodo: (id) =>
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),
  reorderTodos: (todos) => set({ todos }),
}))
