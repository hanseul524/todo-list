import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { Todo, Priority } from "@todo/types"
import { updateTodo } from "../api/updateTodo"
import { useTodoStore } from "@/shared/model/useTodoStore"
import { useCategoryStore } from "@/shared/model/useCategoryStore"

interface Props {
  todo: Todo | null
  visible: boolean
  onClose: () => void
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: "high", label: "높음", color: "#e5534b" },
  { value: "medium", label: "중간", color: "#d9922a" },
  { value: "low", label: "낮음", color: "#27a644" },
]

export function TodoEditModal({ todo, visible, onClose }: Props) {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState("")
  const [loading, setLoading] = useState(false)

  const updateTodoStore = useTodoStore((s) => s.updateTodo)
  const categories = useCategoryStore((s) => s.categories)

  useEffect(() => {
    if (todo) {
      setTitle(todo.title)
      setPriority(todo.priority)
      setCategoryId(todo.category_id)
      setDueDate(todo.due_date ?? "")
    }
  }, [todo])

  const handleSave = async () => {
    if (!todo) return
    if (!title.trim()) {
      Alert.alert("입력 오류", "제목을 입력해주세요.")
      return
    }

    const updates = {
      title: title.trim(),
      priority,
      category_id: categoryId,
      due_date: dueDate || null,
    }

    // 낙관적 업데이트
    updateTodoStore(todo.id, updates)
    onClose()
    setLoading(true)

    try {
      await updateTodo(todo.id, updates)
    } catch (err) {
      // 롤백
      updateTodoStore(todo.id, {
        title: todo.title,
        priority: todo.priority,
        category_id: todo.category_id,
        due_date: todo.due_date,
      })
      const message = err instanceof Error ? err.message : "수정에 실패했습니다."
      Alert.alert("오류", message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white dark:bg-gray-900"
      >
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={onClose} accessibilityLabel="닫기">
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            할 일 편집
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={loading} accessibilityLabel="저장">
            {loading ? (
              <ActivityIndicator size="small" color="#5e6ad2" />
            ) : (
              <Text className="text-indigo-600 font-semibold text-base">저장</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          <View className="gap-5">
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                제목 *
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-base"
                placeholder="할 일을 입력하세요"
                placeholderTextColor="#9ca3af"
                value={title}
                onChangeText={setTitle}
                multiline
                accessibilityLabel="할 일 제목"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                우선순위
              </Text>
              <View className="flex-row gap-2">
                {PRIORITY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setPriority(opt.value)}
                    className="flex-1 rounded-lg py-2 items-center border"
                    style={{
                      backgroundColor: priority === opt.value ? opt.color + "22" : "transparent",
                      borderColor: priority === opt.value ? opt.color : "#d1d5db",
                    }}
                    accessibilityLabel={`우선순위 ${opt.label}`}
                  >
                    <Text
                      className="text-sm font-medium"
                      style={{ color: priority === opt.value ? opt.color : "#6b7280" }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {categories.length > 0 && (
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  카테고리
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => setCategoryId(null)}
                      className="rounded-full px-3 py-1.5 border"
                      style={{
                        backgroundColor: categoryId === null ? "#5e6ad222" : "transparent",
                        borderColor: categoryId === null ? "#5e6ad2" : "#d1d5db",
                      }}
                      accessibilityLabel="카테고리 없음"
                    >
                      <Text
                        className="text-sm"
                        style={{ color: categoryId === null ? "#5e6ad2" : "#6b7280" }}
                      >
                        없음
                      </Text>
                    </TouchableOpacity>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setCategoryId(cat.id)}
                        className="rounded-full px-3 py-1.5 border"
                        style={{
                          backgroundColor: categoryId === cat.id ? cat.color + "22" : "transparent",
                          borderColor: categoryId === cat.id ? cat.color : "#d1d5db",
                        }}
                        accessibilityLabel={`카테고리 ${cat.name}`}
                      >
                        <Text
                          className="text-sm"
                          style={{ color: categoryId === cat.id ? cat.color : "#6b7280" }}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                마감일 (YYYY-MM-DD)
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                placeholder="예: 2025-12-31"
                placeholderTextColor="#9ca3af"
                value={dueDate}
                onChangeText={setDueDate}
                accessibilityLabel="마감일"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}
