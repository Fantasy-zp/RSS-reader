import apiClient from './client'
import type { User } from '@/types'

export const authApi = {
  getCurrentUser() {
    return apiClient.get<User>('/me')
  },
}
