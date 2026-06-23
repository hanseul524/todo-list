"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
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
import { updateTodo } from "@/features/todo-edit/api/updateTodo"
import type { Todo, Priority } from "@/entities/todo/model/types"

interface Props {
  todo: Todo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TodoEditDialog({ todo, open, onOpenChange }: Props) {
  const { updateTodo: updateStore, setTodos, todos } = useTodoStore()
  const { categories } = useCategoryStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const [title, setTitle] = useState(todo?.title ?? "")
  const [priority, setPriority] = useState<Priority>(todo?.priority ?? "medium")
  const [categoryId, setCategoryId] = useState(todo?.category_id ?? "")
  const [dueDate, setDueDate] = useState<Date | undefined>(
    todo?.due_date ? new Date(todo.due_date) : undefined
  )

  // todo가 변경되면 폼 초기화
  const [lastTodoId, setLastTodoId] = useState(todo?.id)
  if (todo?.id !== lastTodoId) {
    setLastTodoId(todo?.id)
    setTitle(todo?.title ?? "")
    setPriority(todo?.priority ?? "medium")
    setCategoryId(todo?.category_id ?? "")
    setDueDate(todo?.due_date ? new Date(todo.due_date) : undefined)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!todo || !title.trim()) return

    setIsSubmitting(true)
    const previousTodos = todos

    // 낙관적 업데이트
    updateStore(todo.id, {
      title: title.trim(),
      priority,
      category_id: categoryId || null,
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
    })
    onOpenChange(false)

    const result = await updateTodo(todo.id, {
      title: title.trim(),
      priority,
      category_id: categoryId || null,
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
    })

    if (result.error) {
      setTodos(previousTodos)
      toast({
        title: "수정 실패",
        description: result.error,
        variant: "destructive",
      })
    }

    setIsSubmitting(false)
  }

  if (!todo) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">투두 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">제목</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="투두 제목"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>우선순위</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">높음</SelectItem>
                  <SelectItem value="medium">중간</SelectItem>
                  <SelectItem value="low">낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>카테고리</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="없음" />
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
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>마감일</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal h-9">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  {dueDate
                    ? format(dueDate, "PPP", { locale: ko })
                    : "날짜 선택"}
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
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={!title.trim() || isSubmitting}>
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
