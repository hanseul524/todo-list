"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/shared/api/supabaseServer"

/**
 * 이메일/비밀번호로 로그인합니다.
 * @param formData - 이메일(email)과 비밀번호(password) 포함
 */
// @MX:ANCHOR: [AUTO] signIn — 인증 진입점, LoginForm에서 호출되는 Server Action
// @MX:REASON: 인증 흐름의 핵심 경로로, 세션 쿠키 설정과 리다이렉트를 담당
export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/")
}

/**
 * 새 계정을 생성합니다.
 * @param formData - 이메일(email)과 비밀번호(password) 포함
 */
export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/")
}

/**
 * 현재 세션을 로그아웃합니다.
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
