import { View } from "react-native"
import { router } from "expo-router"
import { LoginForm } from "@/features/auth/ui/LoginForm"
import { GitHubLoginButton } from "@/features/auth/ui/GitHubLoginButton"

export default function LoginScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <LoginForm onSignUpPress={() => router.push("/(auth)/signup")} />
      <View className="px-6 pb-8">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </View>
        <GitHubLoginButton />
      </View>
    </View>
  )
}
