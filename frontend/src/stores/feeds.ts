import { defineStore } from 'pinia'
import { ref } from 'vue'
import { feedsApi, type FeedWithStats } from '@/api/feeds'
import { categoriesApi } from '@/api/categories'

export const useFeedsStore = defineStore('feeds', () => {
  const feeds = ref<FeedWithStats[]>([])
  const categories = ref<Array<{ id: number; title: string }>>([])
  const loading = ref(false)

  async function fetchFeeds() {
    loading.value = true
    try {
      const response = await feedsApi.list()
      feeds.value = response.data
    } catch (error) {
      console.error('Failed to fetch feeds:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    try {
      const response = await categoriesApi.list()
      categories.value = response.data
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  async function refreshFeed(feedId: number) {
    try {
      await feedsApi.refresh(feedId)
      await fetchFeeds()
    } catch (error) {
      console.error('Failed to refresh feed:', error)
    }
  }

  async function deleteFeed(feedId: number) {
    try {
      await feedsApi.delete(feedId)
      feeds.value = feeds.value.filter(f => f.id !== feedId)
    } catch (error) {
      console.error('Failed to delete feed:', error)
      throw error
    }
  }

  function getFeedById(id: number) {
    return feeds.value.find(f => f.id === id)
  }

  function getCategoryById(id: number) {
    return categories.value.find(c => c.id === id)
  }

  return {
    feeds,
    categories,
    loading,
    fetchFeeds,
    fetchCategories,
    refreshFeed,
    deleteFeed,
    getFeedById,
    getCategoryById,
  }
})
