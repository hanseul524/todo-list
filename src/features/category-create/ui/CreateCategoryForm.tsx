"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { useCategoryStore } from "@/entities/category/model/useCategoryStore"
import { useToast } from "@/shared/lib/use-toast"
import { createCategory } from "@/features/category-create/api/createCategory"

const PRESET_COLORS = [
  "#5e6ad2", "#e5534b", "#d9922a", "#27a644",
  "#0891b2", "#7c3aed", "#db2777", "#64748b",
]

export function CreateCategoryForm() {
  const [name, setName] = useState("")
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addCategory, removeCategory } = useCategoryStore()
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    const tempId = `temp-cat-${Date.now()}`
    const optimistic = {
      id: tempId,
      user_id: "",
      name: name.trim(),
      color,
      created_at: new Date().toISOString(),
    }
    addCategory(optimistic)
    const savedName = name.trim()
    setName("")

    const result = await createCategory({ name: savedName, color })

    if (result.error) {
      removeCategory(tempId)
      toast({
        title: "카테고리 생성 실패",
        description: result.error,
        variant: "destructive",
      })
    } else if (result.data) {
      removeCategory(tempId)
      addCategory(result.data)
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="cat-name">카테고리 이름</Label>
        <Input
          id="cat-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="카테고리 이름"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label>색상</Label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor: color === c ? c : "transparent",
                outline: color === c ? `2px solid ${c}` : "none",
                outlineOffset: "2px",
              }}
            />
          ))}
        </div>
      </div>
      <Button type="submit" size="sm" disabled={!name.trim() || isSubmitting}>
        <Plus className="mr-1 h-3.5 w-3.5" />
        추가
      </Button>
    </form>
  )
}
