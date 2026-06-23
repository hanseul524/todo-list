import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { createCategory } from "../api/createCategory"
import { useCategoryStore } from "@/shared/model/useCategoryStore"
import { useAuthStore } from "@/shared/model/useAuthStore"

interface Props {
  visible: boolean
  onClose: () => void
}

const PRESET_COLORS = [
  "#e5534b", "#d9922a", "#27a644", "#5e6ad2",
  "#0ea5e9", "#8b5cf6", "#ec4899", "#14b8a6",
]

export function CreateCategoryForm({ visible, onClose }: Props) {
  const [name, setName] = useState("")
  const [color, setColor] = useState(PRESET_COLORS[3])
  const [loading, setLoading] = useState(false)

  const addCategory = useCategoryStore((s) => s.addCategory)
  const user = useAuthStore((s) => s.user)

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("입력 오류", "카테고리 이름을 입력해주세요.")
      return
    }
    if (!user) return

    setLoading(true)
    try {
      const category = await createCategory({
        name: name.trim(),
        color,
        user_id: user.id,
      })
      addCategory(category)
      handleClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : "카테고리 생성에 실패했습니다."
      Alert.alert("오류", message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName("")
    setColor(PRESET_COLORS[3])
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
            새 카테고리
          </Text>
          <TouchableOpacity onPress={handleCreate} disabled={loading} accessibilityLabel="저장">
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
                이름 *
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-base"
                placeholder="카테고리 이름"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                autoFocus
                accessibilityLabel="카테고리 이름"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                색상
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {PRESET_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setColor(c)}
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: c }}
                    accessibilityLabel={`색상 선택 ${c}`}
                  >
                    {color === c && (
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-row items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <View
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              <Text className="text-gray-700 dark:text-gray-300">
                {name || "카테고리 이름"}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}
