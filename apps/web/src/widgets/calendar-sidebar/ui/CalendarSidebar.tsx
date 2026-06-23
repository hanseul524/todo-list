"use client"

import { useMemo } from "react"
import { DayButton } from "react-day-picker"
import { Calendar, CalendarDayButton } from "@/shared/ui/calendar"
import { useTodoStore } from "@/entities/todo/model/useTodoStore"
import { useCalendarStore } from "@/shared/model/useCalendarStore"
import { getPriorityMapByDate } from "@/shared/lib/calendarUtils"
import { PriorityBar } from "@/entities/todo/ui/PriorityBar"

const toDateKey = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-CA")

export function CalendarSidebar() {
  const todos = useTodoStore((s) => s.todos)
  const { selectedDate, setSelectedDate } = useCalendarStore()

  const priorityMap = useMemo(
    () => getPriorityMapByDate(todos),
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
            const priorities = priorityMap[dateKey] ?? []
            return (
              <CalendarDayButton {...props}>
                <span>{props.day.date.getDate()}</span>
                <PriorityBar priorities={priorities} />
              </CalendarDayButton>
            )
          },
        }}
      />
    </div>
  )
}
