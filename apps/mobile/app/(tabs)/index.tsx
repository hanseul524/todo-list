import { useEffect } from "react"
import { View, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { supabase } from "@/shared/api/supabase"
import { useAuthStore } from "@/shared/model/useAuthStore"
import { useTodoStore } from "@/shared/model/useTodoStore"
import { useCategoryStore } from "@/shared/model/useCategoryStore"
import { CalendarWidget } from "@/widgets/calendar/ui/CalendarWidget"
import { TodoList } from "@/widgets/todo-list/ui/TodoList"
import { Header } from "@/widgets/header/ui/Header"
import type { Todo, Category } from "@todo/types"

// @MX:ANCHOR: [AUTO] Main screen - orchestrates calendar + todo list, fan_in = root entry point
// @MX:REASON: Responsible for initial data load; all widgets depend on store state populated here

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user)
  const setTodos = useTodoStore((s) => s.setTodos)
  const setCategories = useCategoryStore((s) => s.setCategories)

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        const [todosResult, categoriesResult] = await Promise.all([
          supabase
            .from("todos")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("categories")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true }),
        ])

        if (todosResult.error) throw todosResult.error
        if (categoriesResult.error) throw categoriesResult.error

        setTodos((todosResult.data ?? []) as Todo[])
        setCategories((categoriesResult.data ?? []) as Category[])
      } catch (err) {
        const message = err instanceof Error ? err.message : "데이터를 불러오지 못했습니다."
        Alert.alert("오류", message)
      }
    }

    loadData()
  }, [user, setTodos, setCategories])

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={["top"]}>
      <Header title="Todo" />
      <View className="flex-1">
        <CalendarWidget />
        <TodoList />
      </View>
    </SafeAreaView>
  )
}
