"use client"

import { useState } from "react"
import { GripVertical, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Checkbox } from "@/shared/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Button } from "@/shared/ui/button"
import { TodoPriorityBadge } from "./TodoPriorityBadge"
import { CategoryBadge } from "@/entities/category/ui/CategoryBadge"
import type { Todo } from "@/entities/todo/model/types"
import type { Category } from "@/entities/category/model/types"
import { cn } from "@/shared/lib/utils"

interface Props {
  todo: Todo
  categories: Category[]
  onToggle: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  isDragging?: boolean
}

export function TodoItem({
  todo,
  categories,
  onToggle,
  onEdit,
  onDelete,
  dragHandleProps,
  isDragging,
}: Props) {
  const [isChecked, setIsChecked] = useState(todo.is_done)
  const category = categories.find((c) => c.id === todo.category_id)
  const isOverdue =
    todo.due_date && !todo.is_done && new Date(todo.due_date) < new Date()

  const handleToggle = () => {
    setIsChecked(!isChecked)
    onToggle(todo.id)
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-2 rounded-md border border-border bg-card p-3 transition-all duration-150",
        "hover:bg-accent/30 hover:border-border/80",
        todo.is_done && "opacity-50",
        isDragging && "border-[#5e6ad2] opacity-80 cursor-grabbing"
      )}
    >
      <div className="flex items-start gap-2">
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="mt-0.5 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <Checkbox
          checked={isChecked}
          onCheckedChange={handleToggle}
          className="mt-0.5 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium text-foreground leading-5 break-words",
              todo.is_done && "line-through text-muted-foreground"
            )}
          >
            {todo.title}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <TodoPriorityBadge priority={todo.priority} />
            {category && <CategoryBadge category={category} />}
            {todo.due_date && (
              <span
                className={cn(
                  "text-[11px]",
                  isOverdue ? "text-[#e5534b]" : "text-muted-foreground"
                )}
              >
                {new Date(todo.due_date).toLocaleDateString("ko-KR")}
              </span>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => onEdit(todo)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              수정
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(todo.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
