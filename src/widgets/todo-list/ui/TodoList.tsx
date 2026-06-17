"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useTodoStore } from "@/entities/todo/model/useTodoStore"
import { useCategoryStore } from "@/entities/category/model/useCategoryStore"
import { useFilterStore } from "@/shared/model/useFilterStore"
import { useCalendarStore } from "@/shared/model/useCalendarStore"
import { TodoItem } from "@/entities/todo/ui/TodoItem"
import { TodoEditDialog } from "@/features/todo-edit/ui/TodoEditDialog"
import { AddTodoForm } from "@/features/todo-create/ui/AddTodoForm"
import { useToast } from "@/shared/lib/use-toast"
import { toggleTodo } from "@/features/todo-toggle/api/toggleTodo"
import { deleteTodo } from "@/features/todo-delete/api/deleteTodo"
import { reorderTodos } from "@/features/todo-reorder/api/reorderTodos"
import type { Todo } from "@/entities/todo/model/types"
import type { Category } from "@/entities/category/model/types"

// en-CA 로케일은 YYYY-MM-DD 형식 반환 (날짜 필터 키 생성에 사용)
const toDateKey = (d: Date | string) => new Date(d).toLocaleDateString("en-CA")

interface SortableItemProps {
  todo: Todo
  categories: Category[]
  onToggle: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
}

function SortableTodoItem({ todo, categories, onToggle, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <TodoItem
        todo={todo}
        categories={categories}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  )
}

// @MX:ANCHOR: [AUTO] TodoList — 투두 목록 위젯의 핵심 컴포넌트, 필터/정렬/DnD/낙관적 업데이트 통합
// @MX:REASON: todo-toggle, todo-delete, todo-reorder 3개 Server Action과 연동되며 FilterStore를 구독
export function TodoList() {
  const { todos, updateTodo, deleteTodo: deleteFromStore, setTodos, reorderTodos: reorderStore } =
    useTodoStore()
  const { categories } = useCategoryStore()
  const { searchQuery, filterBy, sortBy, selectedCategory } = useFilterStore()
  const selectedDate = useCalendarStore((s) => s.selectedDate)
  const { toast } = useToast()
  const [editTodo, setEditTodo] = useState<Todo | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const dateTitle = selectedDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  // 클라이언트 사이드 필터링 + 정렬
  const filteredTodos = todos
    .filter((t) => toDateKey(t.created_at) === toDateKey(selectedDate))
    .filter((t) => {
      if (filterBy === "done") return t.is_done
      if (filterBy === "undone") return !t.is_done
      return true
    })
    .filter((t) => {
      if (selectedCategory) return t.category_id === selectedCategory
      return true
    })
    .filter((t) => {
      if (!searchQuery) return true
      return t.title.toLowerCase().includes(searchQuery.toLowerCase())
    })
    .sort((a, b) => {
      if (sortBy === "created_at") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (sortBy === "due_date") {
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      }
      if (sortBy === "priority") {
        const order: Record<string, number> = { high: 0, medium: 1, low: 2 }
        return order[a.priority] - order[b.priority]
      }
      // position
      return a.position - b.position
    })

  async function handleToggle(id: string) {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return

    const previousTodos = todos
    updateTodo(id, { is_done: !todo.is_done })

    const result = await toggleTodo(id, !todo.is_done)
    if (result.error) {
      setTodos(previousTodos)
      toast({ title: "토글 실패", description: result.error, variant: "destructive" })
    }
  }

  async function handleDelete(id: string) {
    const previousTodos = todos
    deleteFromStore(id)

    const result = await deleteTodo(id)
    if (result.error) {
      setTodos(previousTodos)
      toast({ title: "삭제 실패", description: result.error, variant: "destructive" })
    }
  }

  function handleEdit(todo: Todo) {
    setEditTodo(todo)
    setEditOpen(true)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = filteredTodos.findIndex((t) => t.id === active.id)
    const newIndex = filteredTodos.findIndex((t) => t.id === over.id)

    const newOrder = arrayMove(filteredTodos, oldIndex, newIndex)
    const previousTodos = todos
    reorderStore(newOrder)

    const result = await reorderTodos(newOrder.map((t) => t.id))
    if (result.error) {
      setTodos(previousTodos)
      toast({ title: "순서 변경 실패", description: result.error, variant: "destructive" })
    }
  }

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-sm text-muted-foreground">
        {searchQuery ? "검색 결과가 없습니다" : "이 날에 등록된 투두가 없습니다. 새 투두를 추가해보세요!"}
      </p>
    </div>
  )

  if (sortBy === "position") {
    return (
      <>
        <h2 className="text-base font-semibold text-foreground mb-3">{dateTitle}</h2>
        <AddTodoForm />
        <div className="mt-4">
          {filteredTodos.length === 0 ? emptyState : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredTodos.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col divide-y divide-border">
                  {filteredTodos.map((todo) => (
                    <SortableTodoItem
                      key={todo.id}
                      todo={todo}
                      categories={categories}
                      onToggle={handleToggle}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
        <TodoEditDialog todo={editTodo} open={editOpen} onOpenChange={setEditOpen} />
      </>
    )
  }

  return (
    <>
      <h2 className="text-base font-semibold text-foreground mb-3">{dateTitle}</h2>
      <AddTodoForm />
      <div className="mt-4">
        {filteredTodos.length === 0 ? emptyState : (
          <div className="flex flex-col divide-y divide-border">
            {filteredTodos.map((todo) => (
              <div key={todo.id}>
                <TodoItem
                  todo={todo}
                  categories={categories}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <TodoEditDialog todo={editTodo} open={editOpen} onOpenChange={setEditOpen} />
    </>
  )
}
