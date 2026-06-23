/**
 * GitHub OAuth Callback Route Handler
 *
 * Supabase Dashboard Setup (수동 작업):
 * 1. Supabase Dashboard → Authentication → Providers → GitHub → Enable
 * 2. GitHub OAuth App 생성: https://github.com/settings/developers
 *    - Homepage URL: http://localhost:3001 (개발) / 배포 URL (프로덕션)
 *    - Authorization callback URL: https://{project-ref}.supabase.co/auth/v1/callback
 * 3. Client ID와 Client Secret을 Supabase Dashboard에 입력
 * 4. 환경변수: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
import { createClient } from "@/shared/api/supabaseServer"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }
  return NextResponse.redirect(new URL("/login?error=auth_failed", request.url))
}
