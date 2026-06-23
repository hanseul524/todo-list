import { useEffect } from "react"
import { View, Text, ActivityIndicator } from "react-native"
import { useURL } from "expo-linking"
import { router } from "expo-router"
import { supabase } from "@/shared/api/supabase"

// @MX:WARN: [AUTO] OAuth 콜백 딥링크 파싱 - URL에서 토큰 추출
// @MX:REASON: 딥링크 URL 파싱 실패 시 인증 상태가 불확실해지므로 에러 핸들링 필수

export default function AuthCallbackScreen() {
  const url = useURL()

  useEffect(() => {
    if (!url) return

    const handleCallback = async () => {
      try {
        const parsedUrl = new URL(url)
        const accessToken = parsedUrl.searchParams.get("access_token")
        const refreshToken = parsedUrl.searchParams.get("refresh_token")

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (error) throw error
        }

        router.replace("/(tabs)/")
      } catch {
        router.replace("/(auth)/login")
      }
    }

    handleCallback()
  }, [url])

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <ActivityIndicator size="large" color="#5e6ad2" />
      <Text className="text-gray-500 dark:text-gray-400 mt-4">
        로그인 처리 중...
      </Text>
    </View>
  )
}
