import { create } from "zustand"
import type { Todo } from "@todo/types"

interface TodoStore {
  todos: Todo[]
  setTodos: (todos: Todo[]) => void
  addTodo: (todo: Todo) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
}

// @MX:ANCHOR: [AUTO] Todo store - central todo state, fan_in >= 3
// @MX:REASON: Used by widgets, feature create/edit/delete/toggle layers
export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  setTodos: (todos) => set({ todos }),
  addTodo: (todo) => set((state) => ({ todos: [todo, ...state.todos] })),
  updateTodo: (id, updates) =>
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTodo: (id) =>
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),
}))
