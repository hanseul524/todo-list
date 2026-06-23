import { View, Text, TouchableOpacity, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { Todo, Category } from "@todo/types"

const PRIORITY_COLORS = {
  high: "#e5534b",
  medium: "#d9922a",
  low: "#27a644",
} as const

const PRIORITY_LABELS = {
  high: "높음",
  medium: "중간",
  low: "낮음",
} as const

interface Props {
  todo: Todo
  category?: Category
  onToggle: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, category, onToggle, onEdit, onDelete }: Props) {
  const todayKey = new Date().toLocaleDateString("en-CA")
  const dueDateKey = todo.due_date
    ? new Date(todo.due_date).toLocaleDateString("en-CA")
    : null
  const isOverdue = dueDateKey !== null && !todo.is_done && dueDateKey < todayKey

  return (
    <View className="flex-row items-center gap-3 py-3 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <TouchableOpacity onPress={() => onToggle(todo.id)} accessibilityLabel={todo.is_done ? "완료 취소" : "완료 처리"}>
        <Ionicons
          name={todo.is_done ? "checkmark-circle" : "ellipse-outline"}
          size={22}
          color={todo.is_done ? "#5e6ad2" : "#9ca3af"}
        />
      </TouchableOpacity>

      <Pressable className="flex-1" onPress={() => onEdit(todo)} accessibilityLabel="할 일 편집">
        <Text
          className={`text-base ${
            todo.is_done
              ? "line-through text-gray-400"
              : "text-gray-900 dark:text-gray-100"
          }`}
          numberOfLines={2}
        >
          {todo.title}
        </Text>
        <View className="flex-row items-center gap-2 mt-1 flex-wrap">
          <View
            className="rounded-full px-2 py-0.5"
            style={{ backgroundColor: PRIORITY_COLORS[todo.priority] + "22" }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: PRIORITY_COLORS[todo.priority] }}
            >
              {PRIORITY_LABELS[todo.priority]}
            </Text>
          </View>

          {category && (
            <View
              className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: category.color + "33" }}
            >
              <Text className="text-xs" style={{ color: category.color }}>
                {category.name}
              </Text>
            </View>
          )}

          {dueDateKey && (
            <Text
              className="text-xs"
              style={{ color: isOverdue ? "#e5534b" : "#9ca3af" }}
            >
              {new Date(todo.due_date!).toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          )}
        </View>
      </Pressable>

      <TouchableOpacity
        onPress={() => onDelete(todo.id)}
        className="p-1"
        accessibilityLabel="삭제"
      >
        <Ionicons name="trash-outline" size={18} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  )
}
