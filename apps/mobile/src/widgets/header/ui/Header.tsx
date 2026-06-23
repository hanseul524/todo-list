import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { signOut } from "@/features/auth/api/authActions"
import { Alert } from "react-native"

interface Props {
  title?: string
}

export function Header({ title = "Todo" }: Props) {
  const handleSignOut = () => {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut()
          } catch {
            Alert.alert("오류", "로그아웃에 실패했습니다.")
          }
        },
      },
    ])
  }

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <Text className="text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </Text>
      <TouchableOpacity
        onPress={handleSignOut}
        className="p-1"
        accessibilityLabel="로그아웃"
      >
        <Ionicons name="log-out-outline" size={22} color="#6b7280" />
      </TouchableOpacity>
    </View>
  )
}
