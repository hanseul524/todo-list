"use client"

import type { Category } from "@/entities/category/model/types"

interface Props {
  category: Pick<Category, "name" | "color">
}

export function CategoryBadge({ category }: Props) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{
        backgroundColor: category.color + "20",
        color: category.color,
        borderColor: category.color + "40",
        border: "1px solid",
      }}
    >
      {category.name}
    </span>
  )
}
