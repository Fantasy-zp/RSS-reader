import axios, { type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add Basic Auth
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const auth = sessionStorage.getItem('rss_auth')
    if (auth) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Basic ${auth}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError<{ error_message: string }>) => {
    if (error.response?.status === 401) {
      ElMessage.error('认证失败，请重新登录')
      sessionStorage.removeItem('rss_auth')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    const message = error.response?.data?.error_message || error.message || '请求失败'
    ElMessage.error(message)

    return Promise.reject(error)
  }
)

export default apiClient
