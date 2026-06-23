import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { signIn } from "../api/authActions"

interface Props {
  onSignUpPress: () => void
}

export function LoginForm({ onSignUpPress }: Props) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 입력해주세요.")
      return
    }
    setLoading(true)
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      const message = err instanceof Error ? err.message : "로그인에 실패했습니다."
      Alert.alert("로그인 실패", message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 justify-center px-6 bg-white dark:bg-gray-900">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          로그인
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 mb-8">
          Todo 앱에 오신 것을 환영합니다
        </Text>

        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              이메일
            </Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              placeholder="이메일을 입력하세요"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="이메일 입력"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              비밀번호
            </Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              placeholder="비밀번호를 입력하세요"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              accessibilityLabel="비밀번호 입력"
            />
          </View>

          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            className="bg-indigo-600 rounded-lg py-3 items-center mt-2"
            accessibilityLabel="로그인 버튼"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">로그인</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSignUpPress}
            className="items-center py-2"
            accessibilityLabel="회원가입 페이지로 이동"
          >
            <Text className="text-indigo-600 dark:text-indigo-400">
              계정이 없으신가요? <Text className="font-semibold">회원가입</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
