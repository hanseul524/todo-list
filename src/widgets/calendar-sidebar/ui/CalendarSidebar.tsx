"use client"

import { useMemo } from "react"
import { DayButton } from "react-day-picker"
import { Calendar, CalendarDayButton } from "@/shared/ui/calendar"
import { useTodoStore } from "@/entities/todo/model/useTodoStore"
import { useCalendarStore } from "@/shared/model/useCalendarStore"
import { cn } from "@/shared/lib/utils"

// en-CA 로케일은 YYYY-MM-DD 형식 반환 (ISO 날짜 키 생성에 사용)
const toDateKey = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-CA")

export function CalendarSidebar() {
  const todos = useTodoStore((s) => s.todos)
  const { selectedDate, setSelectedDate } = useCalendarStore()

  const datesWithTodos = useMemo(
    () => new Set(todos.map((t) => toDateKey(t.created_at))),
    [todos]
  )

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-muted-foreground px-1">캘린더</h2>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => {
          if (date) setSelectedDate(date)
        }}
        className="rounded-md"
        components={{
          DayButton: (props: React.ComponentProps<typeof DayButton>) => {
            const dateKey = toDateKey(props.day.date)
            const hasTodo = datesWithTodos.has(dateKey)
            return (
              <CalendarDayButton {...props}>
                <span>{props.day.date.getDate()}</span>
                {hasTodo && (
                  <span
                    className={cn(
                      "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#5e6ad2]"
                    )}
                  />
                )}
              </CalendarDayButton>
            )
          },
        }}
      />
    </div>
  )
}
