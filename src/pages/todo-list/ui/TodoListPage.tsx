"use client"

import { Header } from "@/widgets/header/ui/Header"
import { TodoList } from "@/widgets/todo-list/ui/TodoList"
import { AddTodoForm } from "@/features/todo-create/ui/AddTodoForm"
import { TodoFilter } from "@/features/todo-filter/ui/TodoFilter"

export function TodoListPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1200px] mx-auto px-6 py-6 space-y-6">
        <div className="flex flex-col gap-4">
          <AddTodoForm />
          <TodoFilter />
        </div>
        <TodoList />
      </main>
    </div>
  )
}
