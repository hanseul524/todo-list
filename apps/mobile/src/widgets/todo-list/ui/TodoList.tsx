import { useState, useMemo } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { Todo } from "@todo/types"
import { TodoItem } from "@/entities/todo/ui/TodoItem"
import { TodoEditModal } from "@/features/todo-edit/ui/TodoEditModal"
import { AddTodoForm } from "@/features/todo-create/ui/AddTodoForm"
import { deleteTodo } from "@/features/todo-delete/api/deleteTodo"
import { toggleTodo } from "@/features/todo-toggle/api/toggleTodo"
import { useTodoStore } from "@/shared/model/useTodoStore"
import { useCategoryStore } from "@/shared/model/useCategoryStore"
import { useCalendarStore } from "@/shared/model/useCalendarStore"

export function TodoList() {
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const todos = useTodoStore((s) => s.todos)
  const updateTodoStore = useTodoStore((s) => s.updateTodo)
  const deleteTodoStore = useTodoStore((s) => s.deleteTodo)
  const categories = useCategoryStore((s) => s.categories)
  const selectedDate = useCalendarStore((s) => s.selectedDate)

  const filteredTodos = useMemo(() => {
    return todos.filter((t) => {
      const createdKey = new Date(t.created_at).toLocaleDateString("en-CA")
      const dueKey = t.due_date
        ? new Date(t.due_date).toLocaleDateString("en-CA")
        : null
      return createdKey === selectedDate || dueKey === selectedDate
    })
  }, [todos, selectedDate])

  const handleToggle = async (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return
    const newDone = !todo.is_done
    // 낙관적 업데이트
    updateTodoStore(id, { is_done: newDone })
    try {
      await toggleTodo(id, newDone)
    } catch (err) {
      // 롤백
      updateTodoStore(id, { is_done: todo.is_done })
      const message = err instanceof Error ? err.message : "업데이트에 실패했습니다."
      Alert.alert("오류", message)
    }
  }

  const handleDelete = (id: string) => {
    Alert.alert("삭제 확인", "이 할 일을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          // 낙관적 삭제
          const snapshot = todos.find((t) => t.id === id)
          deleteTodoStore(id)
          try {
            await deleteTodo(id)
          } catch (err) {
            // 롤백
            if (snapshot) useTodoStore.getState().addTodo(snapshot)
            const message = err instanceof Error ? err.message : "삭제에 실패했습니다."
            Alert.alert("오류", message)
          }
        },
      },
    ])
  }

  const getCategoryForTodo = (todo: Todo) =>
    categories.find((c) => c.id === todo.category_id)

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-16">
      <Ionicons name="checkmark-done-outline" size={48} color="#d1d5db" />
      <Text className="text-gray-400 mt-3 text-base">
        이 날의 할 일이 없습니다
      </Text>
    </View>
  )

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <Text className="text-base font-semibold text-gray-700 dark:text-gray-300">
          {selectedDate} ({filteredTodos.length}개)
        </Text>
        <TouchableOpacity
          onPress={() => setShowAddForm(true)}
          className="flex-row items-center gap-1 bg-indigo-600 rounded-lg px-3 py-1.5"
          accessibilityLabel="할 일 추가"
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text className="text-white text-sm font-medium">추가</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTodos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            category={getCategoryForTodo(item)}
            onToggle={handleToggle}
            onEdit={setEditingTodo}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={filteredTodos.length === 0 ? { flex: 1 } : undefined}
      />

      <TodoEditModal
        todo={editingTodo}
        visible={editingTodo !== null}
        onClose={() => setEditingTodo(null)}
      />

      <AddTodoForm
        visible={showAddForm}
        onClose={() => setShowAddForm(false)}
      />
    </View>
  )
}
