"use client"

import { useState } from "react"
import Link from "next/link"
import { useToast } from "@/shared/lib/use-toast"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { signIn } from "@/features/auth/api/authActions"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      const result = await signIn(formData)
      if (result?.error) {
        toast({
          title: "로그인 실패",
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
          <h1 className="text-2xl font-semibold text-foreground">로그인</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            계정에 로그인하세요
          </p>
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
              placeholder="비밀번호"
              required
              autoComplete="current-password"
              minLength={8}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          계정이 없으신가요?{" "}
          <Link
            href="/signup"
            className="text-primary hover:underline font-medium"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
