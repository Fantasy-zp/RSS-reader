import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import type { User } from '@/types'

// Encode username:password to base64 for Basic Auth
function encodeBasicAuth(username: string, password: string): string {
  const credentials = `${username}:${password}`
  return btoa(credentials)
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const _isAuthenticated = ref(!!sessionStorage.getItem('rss_auth'))

  const isAuthenticated = computed(() => _isAuthenticated.value)
  const isAdmin = computed(() => user.value?.is_admin ?? false)

  async function login(username: string, password: string) {
    loading.value = true
    try {
      // Encode credentials to base64 and store in sessionStorage
      const auth = encodeBasicAuth(username, password)
      sessionStorage.setItem('rss_auth', auth)

      // Validate credentials by fetching current user
      const response = await authApi.getCurrentUser()
      user.value = response.data
      _isAuthenticated.value = true
      return true
    } catch (error) {
      // Clear invalid credentials
      sessionStorage.removeItem('rss_auth')
      user.value = null
      _isAuthenticated.value = false
      console.error('Login failed:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentUser() {
    const auth = sessionStorage.getItem('rss_auth')
    if (!auth) {
      _isAuthenticated.value = false
      return
    }

    try {
      const response = await authApi.getCurrentUser()
      user.value = response.data
      _isAuthenticated.value = true
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout()
    }
  }

  function logout() {
    sessionStorage.removeItem('rss_auth')
    user.value = null
    _isAuthenticated.value = false
  }

  // Auto-fetch user info if auth exists
  if (_isAuthenticated.value && !user.value) {
    fetchCurrentUser()
  }

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    fetchCurrentUser,
  }
})
