import apiClient from './client'
import type { Feed, CreateFeedRequest, UpdateFeedRequest, CategoryWithCount } from '@/types'

export interface FeedWithStats extends Feed {
  category?: CategoryWithCount
  unread_count: number
}

export const feedsApi = {
  list() {
    return apiClient.get<FeedWithStats[]>('/feeds')
  },

  get(id: number) {
    return apiClient.get<Feed>(`/feeds/${id}`)
  },

  create(data: CreateFeedRequest) {
    return apiClient.post<Feed>('/feeds', data)
  },

  update(id: number, data: UpdateFeedRequest) {
    return apiClient.put<Feed>(`/feeds/${id}`, data)
  },

  delete(id: number) {
    return apiClient.delete(`/feeds/${id}`)
  },

  refresh(id: number) {
    return apiClient.post<Feed>(`/feeds/${id}/refresh`)
  },

  refreshAll() {
    return apiClient.post<void>('/feeds/refresh-all')
  },

  getIcon(feedId: number) {
    return apiClient.get<Blob>(`/feeds/${feedId}/icon`, { responseType: 'blob' })
  },
}
