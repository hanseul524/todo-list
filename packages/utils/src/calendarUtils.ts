import type { Todo, Priority } from "@todo/types"

const toDateKey = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-CA") // → "YYYY-MM-DD" local timezone

const PRIORITY_ORDER: Priority[] = ["high", "medium", "low"]

export function getPriorityMapByDate(
  todos: Todo[]
): Record<string, Priority[]> {
  const idSetByDate: Record<string, Set<string>> = {}
  const priorityMap: Record<string, Priority[]> = {}

  for (const todo of todos) {
    const dates = new Set<string>()
    dates.add(toDateKey(todo.created_at))
    if (todo.due_date) dates.add(toDateKey(todo.due_date))

    for (const dateKey of dates) {
      if (!idSetByDate[dateKey]) {
        idSetByDate[dateKey] = new Set()
        priorityMap[dateKey] = []
      }
      if (!idSetByDate[dateKey].has(todo.id)) {
        idSetByDate[dateKey].add(todo.id)
        priorityMap[dateKey].push(todo.priority)
      }
    }
  }

  for (const dateKey of Object.keys(priorityMap)) {
    priorityMap[dateKey].sort(
      (a, b) => PRIORITY_ORDER.indexOf(a) - PRIORITY_ORDER.indexOf(b)
    )
  }

  return priorityMap
}
