import { redirect } from "next/navigation"

// /todos 경로는 사용하지 않음 — 루트(/)가 대시보드
export default function TodosPage() {
  redirect("/")
}
