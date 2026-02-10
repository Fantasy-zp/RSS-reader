import apiClient from './client'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types'

export const categoriesApi = {
  list() {
    return apiClient.get<Category[]>('/categories')
  },

  create(data: CreateCategoryRequest) {
    return apiClient.post<Category>('/categories', data)
  },

  update(id: number, data: UpdateCategoryRequest) {
    return apiClient.put<Category>(`/categories/${id}`, data)
  },

  delete(id: number) {
    return apiClient.delete(`/categories/${id}`)
  },
}
