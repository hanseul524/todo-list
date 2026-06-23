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
  ScrollView,
} from "react-native"
import { router } from "expo-router"
import { signUp } from "@/features/auth/api/authActions"

export default function SignUpScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 입력해주세요.")
      return
    }
    if (password !== confirm) {
      Alert.alert("입력 오류", "비밀번호가 일치하지 않습니다.")
      return
    }
    if (password.length < 6) {
      Alert.alert("입력 오류", "비밀번호는 6자 이상이어야 합니다.")
      return
    }

    setLoading(true)
    try {
      await signUp(email.trim(), password)
      Alert.alert(
        "회원가입 완료",
        "이메일을 확인하여 계정을 활성화해주세요.",
        [{ text: "확인", onPress: () => router.replace("/(auth)/login") }]
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : "회원가입에 실패했습니다."
      Alert.alert("회원가입 실패", message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-white dark:bg-gray-900"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            회원가입
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mb-8">
            새 계정을 만들어보세요
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
                accessibilityLabel="이메일"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                비밀번호
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                placeholder="6자 이상 입력하세요"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                accessibilityLabel="비밀번호"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                비밀번호 확인
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                placeholder="비밀번호를 다시 입력하세요"
                placeholderTextColor="#9ca3af"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                accessibilityLabel="비밀번호 확인"
              />
            </View>

            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              className="bg-indigo-600 rounded-lg py-3 items-center mt-2"
              accessibilityLabel="회원가입"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">회원가입</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              className="items-center py-2"
              accessibilityLabel="로그인 페이지로 이동"
            >
              <Text className="text-indigo-600 dark:text-indigo-400">
                이미 계정이 있으신가요? <Text className="font-semibold">로그인</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
