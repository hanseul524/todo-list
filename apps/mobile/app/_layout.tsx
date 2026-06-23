import "../global.css"
import { useEffect } from "react"
import { Stack } from "expo-router"
import { router } from "expo-router"
import { supabase } from "@/shared/api/supabase"
import { useAuthStore } from "@/shared/model/useAuthStore"

export default function RootLayout() {
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (!session) {
        router.replace("/(auth)/login")
      } else {
        router.replace("/(tabs)/")
      }
    })

    // 인증 상태 변경 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) {
        router.replace("/(auth)/login")
      } else {
        router.replace("/(tabs)/")
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth/callback" />
    </Stack>
  )
}
