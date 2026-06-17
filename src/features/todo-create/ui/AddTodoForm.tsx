"use client"

import { useState } from "react"
import { Plus, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover"
import { Calendar as CalendarComponent } from "@/shared/ui/calendar"
import { useTodoStore } from "@/entities/todo/model/useTodoStore"
import { useCategoryStore } from "@/entities/category/model/useCategoryStore"
import { useToast } from "@/shared/lib/use-toast"
import { createTodo } from "@/features/todo-create/api/createTodo"
import { useCalendarStore } from "@/shared/model/useCalendarStore"
import type { Priority } from "@/entities/todo/model/types"

export function AddTodoForm() {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [categoryId, setCategoryId] = useState<string>("")
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const { addTodo, deleteTodo } = useTodoStore()
  const { categories } = useCategoryStore()
  const { toast } = useToast()
  const selectedDate = useCalendarStore((s) => s.selectedDate)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    // 낙관적 업데이트용 임시 ID
    const tempId = `temp-${Date.now()}`
    const optimisticTodo = {
      id: tempId,
      user_id: "",
      title: title.trim(),
      priority,
      category_id: categoryId || null,
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
      is_done: false,
      position: 9999,
      created_at: selectedDate.toISOString(),
    }

    addTodo(optimisticTodo)
    const savedTitle = title.trim()
    setTitle("")
    setDueDate(undefined)

    const result = await createTodo({
      title: savedTitle,
      priority,
      category_id: categoryId || null,
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
      created_at: selectedDate.toISOString(),
    })

    if (result.error) {
      deleteTodo(tempId)
      toast({
        title: "투두 생성 실패",
        description: result.error,
        variant: "destructive",
      })
    } else if (result.data) {
      // 임시 ID를 실제 ID로 교체
      deleteTodo(tempId)
      addTodo(result.data)
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="새 투두 추가..."
          className="h-9"
        />
      </div>
      <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
        <SelectTrigger className="w-24 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="high">높음</SelectItem>
          <SelectItem value="medium">중간</SelectItem>
          <SelectItem value="low">낮음</SelectItem>
        </SelectContent>
      </Select>
      {categories.length > 0 && (
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">없음</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 w-9 p-0">
            <Calendar className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <CalendarComponent
            mode="single"
            selected={dueDate}
            onSelect={(date) => {
              setDueDate(date)
              setCalendarOpen(false)
            }}
            locale={ko}
          />
        </PopoverContent>
      </Popover>
      {dueDate && (
        <span className="text-xs text-muted-foreground self-center">
          {format(dueDate, "MM/dd")}
        </span>
      )}
      <Button type="submit" size="sm" className="h-9" disabled={!title.trim() || isSubmitting}>
        <Plus className="h-4 w-4 mr-1" />
        추가
      </Button>
    </form>
  )
}
