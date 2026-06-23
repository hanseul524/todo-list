"use client"

import { Header } from "@/widgets/header/ui/Header"
import { TodoList } from "@/widgets/todo-list/ui/TodoList"
import { TodoFilter } from "@/features/todo-filter/ui/TodoFilter"
import { CalendarSidebar } from "@/widgets/calendar-sidebar/ui/CalendarSidebar"

export function TodoListPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <aside className="w-full md:w-[280px] md:shrink-0 overflow-y-auto border-b md:border-b-0 md:border-r border-border p-4">
          <CalendarSidebar />
        </aside>
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-4">
            <TodoFilter />
          </div>
          <TodoList />
        </main>
      </div>
    </div>
  )
}
