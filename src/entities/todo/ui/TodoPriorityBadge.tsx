"use client"

import type { Priority } from "@/entities/todo/model/types"

interface Props {
  priority: Priority
}

const priorityConfig = {
  high: {
    label: "높음",
    textColor: "#e5534b",
    darkBg: "#2d1412",
    lightBg: "#fdf0ef",
  },
  medium: {
    label: "중간",
    textColor: "#d9922a",
    darkBg: "#2b1e0a",
    lightBg: "#fdf5eb",
  },
  low: {
    label: "낮음",
    textColor: "#27a644",
    darkBg: "#0d2414",
    lightBg: "#edf8f0",
  },
}

export function TodoPriorityBadge({ priority }: Props) {
  const config = priorityConfig[priority]
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{
        color: config.textColor,
        backgroundColor: `var(--priority-${priority}-bg, ${config.lightBg})`,
      }}
    >
      {config.label}
    </span>
  )
}
