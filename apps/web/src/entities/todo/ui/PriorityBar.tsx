import type { Priority } from "@/entities/todo/model/types"

const PRIORITY_COLORS: Record<Priority, string> = {
  high: "#e5534b",
  medium: "#d9922a",
  low: "#27a644",
}

interface Props {
  priorities: Priority[]
}

export function PriorityBar({ priorities }: Props) {
  if (priorities.length === 0) return null

  const segmentWidth = `${(100 / priorities.length).toFixed(4)}%`
  const total = priorities.length

  return (
    <div
      className="flex w-full overflow-hidden"
      style={{ height: "3px", borderRadius: "2px" }}
    >
      {priorities.map((p, i) => {
        let borderRadius = "0"
        if (total === 1) {
          borderRadius = "2px"
        } else if (i === 0) {
          borderRadius = "2px 0 0 2px"
        } else if (i === total - 1) {
          borderRadius = "0 2px 2px 0"
        }
        return (
          <div
            key={i}
            style={{
              width: segmentWidth,
              backgroundColor: PRIORITY_COLORS[p],
              borderRadius,
              flexShrink: 0,
            }}
          />
        )
      })}
    </div>
  )
}
