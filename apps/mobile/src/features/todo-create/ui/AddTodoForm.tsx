import { useState } from "react"
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
import type { Priority } from "@todo/types"
import { createTodo } from "../api/createTodo"
import { useTodoStore } from "@/shared/model/useTodoStore"
import { useAuthStore } from "@/shared/model/useAuthStore"
import { useCategoryStore } from "@/shared/model/useCategoryStore"

interface Props {
  visible: boolean
  onClose: () => void
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: "high", label: "높음", color: "#e5534b" },
  { value: "medium", label: "중간", color: "#d9922a" },
  { value: "low", label: "낮음", color: "#27a644" },
]

export function AddTodoForm({ visible, onClose }: Props) {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState("")
  const [loading, setLoading] = useState(false)

  const addTodo = useTodoStore((s) => s.addTodo)
  const user = useAuthStore((s) => s.user)
  const categories = useCategoryStore((s) => s.categories)

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("입력 오류", "할 일 제목을 입력해주세요.")
      return
    }
    if (!user) return

    const optimisticTodo = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      title: title.trim(),
      priority,
      category_id: categoryId,
      due_date: dueDate || null,
      is_done: false,
      position: 0,
      created_at: new Date().toISOString(),
    }

    // 낙관적 업데이트
    addTodo(optimisticTodo)
    handleClose()
    setLoading(true)

    try {
      const created = await createTodo({
        title: optimisticTodo.title,
        priority,
        category_id: categoryId,
        due_date: dueDate || null,
        user_id: user.id,
        created_at: optimisticTodo.created_at,
      })
      // 임시 id를 실제 id로 교체
      useTodoStore.getState().deleteTodo(optimisticTodo.id)
      useTodoStore.getState().addTodo(created)
    } catch (err) {
      // 롤백
      useTodoStore.getState().deleteTodo(optimisticTodo.id)
      const message = err instanceof Error ? err.message : "할 일 생성에 실패했습니다."
      Alert.alert("오류", message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setTitle("")
    setPriority("medium")
    setCategoryId(null)
    setDueDate("")
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white dark:bg-gray-900"
      >
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={handleClose} accessibilityLabel="닫기">
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            새 할 일
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            accessibilityLabel="저장"
          >
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
                autoFocus
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
