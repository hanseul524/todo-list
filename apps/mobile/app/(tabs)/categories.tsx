import { useState } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useCategoryStore } from "@/shared/model/useCategoryStore"
import { deleteCategory } from "@/features/category-delete/api/deleteCategory"
import { CreateCategoryForm } from "@/features/category-create/ui/CreateCategoryForm"
import { Header } from "@/widgets/header/ui/Header"
import type { Category } from "@todo/types"

export default function CategoriesScreen() {
  const [showCreateForm, setShowCreateForm] = useState(false)

  const categories = useCategoryStore((s) => s.categories)
  const deleteCategoryStore = useCategoryStore((s) => s.deleteCategory)

  const handleDelete = (category: Category) => {
    Alert.alert(
      "카테고리 삭제",
      `"${category.name}" 카테고리를 삭제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            // 낙관적 삭제
            deleteCategoryStore(category.id)
            try {
              await deleteCategory(category.id)
            } catch (err) {
              // 롤백
              useCategoryStore.getState().addCategory(category)
              const message = err instanceof Error ? err.message : "삭제에 실패했습니다."
              Alert.alert("오류", message)
            }
          },
        },
      ]
    )
  }

  const renderItem = ({ item }: { item: Category }) => (
    <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <View
        className="w-4 h-4 rounded-full mr-3"
        style={{ backgroundColor: item.color }}
      />
      <Text className="flex-1 text-base text-gray-900 dark:text-white">
        {item.name}
      </Text>
      <TouchableOpacity
        onPress={() => handleDelete(item)}
        className="p-1"
        accessibilityLabel={`${item.name} 삭제`}
      >
        <Ionicons name="trash-outline" size={18} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  )

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-16">
      <Ionicons name="folder-open-outline" size={48} color="#d1d5db" />
      <Text className="text-gray-400 mt-3 text-base">
        카테고리가 없습니다
      </Text>
      <Text className="text-gray-400 text-sm mt-1">
        + 버튼을 눌러 추가하세요
      </Text>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={["top"]}>
      <Header title="카테고리" />

      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {categories.length}개의 카테고리
        </Text>
        <TouchableOpacity
          onPress={() => setShowCreateForm(true)}
          className="flex-row items-center gap-1 bg-indigo-600 rounded-lg px-3 py-1.5"
          accessibilityLabel="카테고리 추가"
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text className="text-white text-sm font-medium">추가</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={categories.length === 0 ? { flex: 1 } : undefined}
      />

      <CreateCategoryForm
        visible={showCreateForm}
        onClose={() => setShowCreateForm(false)}
      />
    </SafeAreaView>
  )
}
