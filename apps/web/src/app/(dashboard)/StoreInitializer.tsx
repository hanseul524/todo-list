"use client"

import { useEffect } from "react"
import { useTodoStore } from "@/entities/todo/model/useTodoStore"
import { useCategoryStore } from "@/entities/category/model/useCategoryStore"
import type { Todo } from "@/entities/todo/model/types"
import type { Category } from "@/entities/category/model/types"

interface Props {
  todos: Todo[]
  categories: Category[]
}

export function StoreInitializer({ todos, categories }: Props) {
  const setTodos = useTodoStore((s) => s.setTodos)
  const setCategories = useCategoryStore((s) => s.setCategories)

  // useEffect는 데이터 페칭이 아닌 store 초기화 목적으로만 사용 (허용됨)
  useEffect(() => {
    setTodos(todos)
    setCategories(categories)
  }, [todos, categories, setTodos, setCategories])

  return null
}
