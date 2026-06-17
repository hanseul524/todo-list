"use client"

import { useState } from "react"
import Link from "next/link"
import { useToast } from "@/shared/lib/use-toast"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { signUp } from "@/features/auth/api/authActions"
import { GitHubLoginButton } from "./GitHubLoginButton"

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      const result = await signUp(formData)
      if (result?.error) {
        toast({
          title: "회원가입 실패",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch {
      // redirect는 catch로 잡힘 — 정상 동작
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground">회원가입</h1>
          <p className="mt-2 text-sm text-muted-foreground">새 계정을 만드세요</p>
        </div>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="비밀번호 (8자 이상)"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "가입 중..." : "회원가입"}
          </Button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">또는</span>
            </div>
          </div>
          <GitHubLoginButton />
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
