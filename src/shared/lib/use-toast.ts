"use client"

// shadcn/ui의 toast hook — sonner 기반으로 구현
import { toast as sonnerToast } from "sonner"

interface ToastOptions {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = ({ title, description, variant }: ToastOptions) => {
    if (variant === "destructive") {
      sonnerToast.error(title, { description })
    } else {
      sonnerToast.success(title, { description })
    }
  }

  return { toast }
}
