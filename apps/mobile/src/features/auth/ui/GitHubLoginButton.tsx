import { useState } from "react"
import { TouchableOpacity, Text, Alert, ActivityIndicator, View } from "react-native"
import * as WebBrowser from "expo-web-browser"
import { makeRedirectUri } from "expo-auth-session"
import { supabase } from "@/shared/api/supabase"
import { Ionicons } from "@expo/vector-icons"

WebBrowser.maybeCompleteAuthSession()

// @MX:WARN: [AUTO] OAuth deep link callback relies on WebBrowser session completion
// @MX:REASON: expo-web-browser must call maybeCompleteAuthSession at module load; missing it breaks OAuth redirect

export function GitHubLoginButton() {
  const [loading, setLoading] = useState(false)

  const handleGitHubLogin = async () => {
    setLoading(true)
    try {
      const redirectTo = makeRedirectUri({
        scheme: "todo-app",
        path: "auth/callback",
      })

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      })

      if (error) throw error
      if (!data.url) throw new Error("OAuth URL을 받지 못했습니다.")

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)

      if (result.type === "success" && result.url) {
        const url = new URL(result.url)
        const accessToken = url.searchParams.get("access_token")
        const refreshToken = url.searchParams.get("refresh_token")

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (sessionError) throw sessionError
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "GitHub 로그인에 실패했습니다."
      Alert.alert("GitHub 로그인 실패", message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <TouchableOpacity
      onPress={handleGitHubLogin}
      disabled={loading}
      className="flex-row items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 rounded-lg py-3 bg-white dark:bg-gray-800"
      accessibilityLabel="GitHub으로 로그인"
    >
      {loading ? (
        <ActivityIndicator color="#374151" />
      ) : (
        <>
          <Ionicons name="logo-github" size={20} color="#374151" />
          <Text className="text-gray-700 dark:text-gray-200 font-medium">
            GitHub으로 로그인
          </Text>
        </>
      )}
    </TouchableOpacity>
  )
}
