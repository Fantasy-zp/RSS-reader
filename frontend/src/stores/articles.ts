import { defineStore } from 'pinia'
import { ref } from 'vue'
import { entriesApi, type Entry, type EntryFilter } from '@/api/entries'

export const useArticlesStore = defineStore('articles', () => {
  const entries = ref<Entry[]>([])
  const currentEntry = ref<Entry | null>(null)
  const total = ref(0)
  const loading = ref(false)
  const currentFilter = ref<EntryFilter>({})

  async function fetchEntries(filter?: EntryFilter) {
    loading.value = true
    try {
      currentFilter.value = filter || {}
      const response = await entriesApi.list({
        limit: 50,
        order: 'published_at',
        direction: 'desc',
        ...filter,
      })
      entries.value = response.data.entries
      total.value = response.data.total
    } catch (error) {
      console.error('Failed to fetch entries:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchEntry(id: number) {
    loading.value = true
    try {
      const response = await entriesApi.get(id)
      currentEntry.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to fetch entry:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(entryId: number) {
    try {
      await entriesApi.markAsRead(entryId)
      const entry = entries.value.find((e: Entry) => e.id === entryId)
      if (entry) entry.status = 'read'
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  async function markAsUnread(entryId: number) {
    try {
      await entriesApi.markAsUnread(entryId)
      const entry = entries.value.find((e: Entry) => e.id === entryId)
      if (entry) entry.status = 'unread'
    } catch (error) {
      console.error('Failed to mark as unread:', error)
    }
  }

  async function toggleStar(entryId: number, starred: boolean) {
    try {
      await entriesApi.toggleStar(entryId, starred)
      const entry = entries.value.find((e: Entry) => e.id === entryId)
      if (entry) entry.starred = starred
      if (currentEntry.value?.id === entryId) {
        currentEntry.value.starred = starred
      }
    } catch (error) {
      console.error('Failed to toggle star:', error)
    }
  }

  async function markAllAsRead(filter?: EntryFilter) {
    try {
      await entriesApi.markAllAsRead(filter)
      entries.value.forEach((e: Entry) => (e.status = 'read'))
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  function getEntryById(id: number) {
    return entries.value.find((e: Entry) => e.id === id)
  }

  return {
    entries,
    currentEntry,
    total,
    loading,
    currentFilter,
    fetchEntries,
    fetchEntry,
    markAsRead,
    markAsUnread,
    toggleStar,
    markAllAsRead,
    getEntryById,
  }
})
