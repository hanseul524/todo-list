# SPEC-AUTH-001 Compact (Run Phase Reference)

> 토큰 효율화 버전. 전체 내용은 spec.md 참조.

## Stack
- Next.js 15 App Router, TypeScript strict, FSD
- `@supabase/ssr` 0.12.0, shadcn/ui, lucide-react, Zustand

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/app/auth/callback/route.ts` | CREATE |
| `src/features/auth/ui/GitHubLoginButton.tsx` | CREATE |
| `src/features/auth/ui/LoginForm.tsx` | MODIFY (add divider + button below submit) |
| `src/features/auth/ui/SignupForm.tsx` | MODIFY (same as LoginForm) |

## DO NOT TOUCH
- `src/features/auth/api/authActions.ts`
- `src/entities/user/model/useAuthStore.ts`
- Existing form logic, inputs, imports in LoginForm/SignupForm

---

## REQ-01: `src/app/auth/callback/route.ts`

```typescript
/**
 * Supabase Dashboard Setup:
 * 1. Authentication → Providers → GitHub → Enable
 * 2. GitHub OAuth App Callback URL: https://{project-ref}.supabase.co/auth/v1/callback
 * 3. Env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
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
```

Key rules:
- Server client ONLY (`@/shared/api/supabaseServer`)
- No browser client import
- JSDoc comment at top (setup guide)

---

## REQ-02: `src/features/auth/ui/GitHubLoginButton.tsx`

```typescript
"use client"

import { createClient } from "@/shared/api/supabaseClient"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

export function GitHubLoginButton() {
  const handleClick = async () => {
    const supabase = createClient()
    const callbackUrl = `${window.location.origin}/auth/callback`
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: callbackUrl },
    })
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleClick}>
      <Github className="mr-2 h-4 w-4" />
      GitHub으로 계속하기
    </Button>
  )
}
```

Key rules:
- `"use client"` required
- Browser client (`@/shared/api/supabaseClient`)
- `variant="outline"` = button-secondary design token
- `Github` (capital G) from lucide-react
- No `any` type

---

## REQ-03 & REQ-04: LoginForm.tsx / SignupForm.tsx

Add BELOW the existing submit `<Button>`, BEFORE closing tag of the form wrapper:

```tsx
import { GitHubLoginButton } from "./GitHubLoginButton"

// Add after submit Button:
<div className="relative my-4">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t border-border" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-background px-2 text-muted-foreground">또는</span>
  </div>
</div>
<GitHubLoginButton />
```

Constraints:
- DO NOT change existing imports, form fields, or Server Action wiring
- Apply identical change to both LoginForm and SignupForm

---

## OAuth Flow Summary

```
User clicks GitHubLoginButton
  → signInWithOAuth({ provider: 'github', redirectTo: origin + '/auth/callback' })
  → GitHub OAuth page

GitHub auth complete
  → GET /auth/callback?code=XXX
  → exchangeCodeForSession(code)
  → Success: redirect /
  → Failure: redirect /login?error=auth_failed

Session cookie set automatically by @supabase/ssr
No useAuthStore changes needed (existing dashboard layout handles session check)
```

---

## FSD Import Rules

```
app/auth/callback/route.ts
  imports: @/shared/api/supabaseServer ✓

features/auth/ui/GitHubLoginButton.tsx
  imports: @/shared/api/supabaseClient ✓
  imports: @/components/ui/button ✓ (shared)
  imports: lucide-react ✓ (external)

features/auth/ui/LoginForm.tsx (modified)
  imports: ./GitHubLoginButton ✓ (same slice)

FORBIDDEN: shared importing features, features importing app
```

---

## Acceptance Checklist (Quick)

- [ ] `tsc --noEmit` passes (no errors)
- [ ] `/login` shows GitHub button below submit
- [ ] `/signup` shows GitHub button below submit
- [ ] Button click → GitHub OAuth page redirect
- [ ] Callback success → redirect `/`
- [ ] Callback failure → redirect `/login?error=auth_failed`
- [ ] email/password login still works on `/login`
- [ ] email/password signup still works on `/signup`
- [ ] No `any` types in new/modified files
- [ ] `authActions.ts` unchanged
