export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface CreateCategoryInput {
  name: string
  color: string
}
