import apiClient from './client'
import type { Entry, EntryFilter, EntryListResponse, UpdateEntryRequest } from '@/types'

export type { Entry, EntryFilter } from '@/types'

export const entriesApi = {
  list(params?: EntryFilter) {
    return apiClient.get<EntryListResponse>('/entries', { params })
  },

  get(id: number) {
    return apiClient.get<Entry>(`/entries/${id}`)
  },

  update(id: number, data: UpdateEntryRequest) {
    return apiClient.put<Entry>(`/entries/${id}`, data)
  },

  markAsRead(id: number) {
    return apiClient.put<Entry>(`/entries/${id}`, { status: 'read' })
  },

  markAsUnread(id: number) {
    return apiClient.put<Entry>(`/entries/${id}`, { status: 'unread' })
  },

  toggleStar(id: number, starred: boolean) {
    return apiClient.put<Entry>(`/entries/${id}`, { starred })
  },

  markAllAsRead(filter?: EntryFilter) {
    return apiClient.put<void>('/entries', {
      status: 'read',
      ...filter,
    })
  },

  getFeedIcon(feedId: number) {
    return apiClient.get<Blob>(`/feeds/${feedId}/icon`, { responseType: 'blob' })
  },
}
