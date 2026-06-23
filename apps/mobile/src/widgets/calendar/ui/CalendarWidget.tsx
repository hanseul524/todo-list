import { useMemo } from "react"
import { View } from "react-native"
import { Calendar } from "react-native-calendars"
import type { DateData } from "react-native-calendars"
import { getPriorityMapByDate } from "@todo/utils"
import { useTodoStore } from "@/shared/model/useTodoStore"
import { useCalendarStore } from "@/shared/model/useCalendarStore"

// @MX:ANCHOR: [AUTO] CalendarWidget - core widget, fan_in >= 3 from index screen and tests
// @MX:REASON: Drives selected date which filters the todo list below it

const PRIORITY_COLORS = {
  high: "#e5534b",
  medium: "#d9922a",
  low: "#27a644",
} as const

export function CalendarWidget() {
  const todos = useTodoStore((s) => s.todos)
  const selectedDate = useCalendarStore((s) => s.selectedDate)
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate)

  const markedDates = useMemo(() => {
    const priorityMap = getPriorityMapByDate(todos)
    const result: Record<string, {
      dots: { key: string; color: string }[]
      selected?: boolean
      selectedColor?: string
    }> = {}

    for (const [dateKey, priorities] of Object.entries(priorityMap)) {
      const dots = priorities.slice(0, 3).map((p, i) => ({
        key: `${p}-${i}`,
        color: PRIORITY_COLORS[p],
      }))
      result[dateKey] = { dots }
    }

    result[selectedDate] = {
      ...(result[selectedDate] ?? { dots: [] }),
      selected: true,
      selectedColor: "#5e6ad2",
    }

    return result
  }, [todos, selectedDate])

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString)
  }

  return (
    <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <Calendar
        current={selectedDate}
        onDayPress={handleDayPress}
        markingType="multi-dot"
        markedDates={markedDates}
        theme={{
          backgroundColor: "transparent",
          calendarBackground: "transparent",
          textSectionTitleColor: "#6b7280",
          selectedDayBackgroundColor: "#5e6ad2",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#5e6ad2",
          dayTextColor: "#111827",
          textDisabledColor: "#d1d5db",
          dotColor: "#5e6ad2",
          selectedDotColor: "#ffffff",
          arrowColor: "#5e6ad2",
          monthTextColor: "#111827",
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
      />
    </View>
  )
}
