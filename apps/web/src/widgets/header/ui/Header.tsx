"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Moon, Sun, LogOut, User } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { useFilterStore } from "@/shared/model/useFilterStore"
import { useAuthStore } from "@/entities/user/model/useAuthStore"
import { signOut } from "@/features/auth/api/authActions"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { searchQuery, setSearchQuery } = useFilterStore()
  const { user } = useAuthStore()

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center gap-4">
        <Link
          href="/"
          className="text-sm font-semibold text-foreground hover:text-primary transition-colors shrink-0"
        >
          Todo
        </Link>

        <div className="flex-1 max-w-sm">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="투두 검색..."
            className="h-8 text-sm"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/categories">
            <Button variant="ghost" size="sm" className="text-xs h-8">
              카테고리
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleTheme}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">테마 전환</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email ?? "로그인 중"}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
