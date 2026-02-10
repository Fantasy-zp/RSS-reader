// User types
export interface User {
  id: number
  username: string
  password: string
  is_admin: boolean
  theme: string
  language: string
  timezone: string
  entry_direction: string
  entries_per_page: number
  keyboard_shortcuts: boolean
  show_reading_time: boolean
  entry_swipe: boolean
  gesture_nav: boolean
  standard_reading_time: number
  created_at: string
  updated_at: string
  last_login_at: string
  extra: Record<string, any>
}

// Category types
export interface Category {
  id: number
  user_id: number
  title: string
  hide_globally: boolean
  created_at: string
  updated_at: string
}

export interface CategoryWithCount extends Category {
  feed_count?: number
  unread_count?: number
}

// Feed types
export interface Feed {
  id: number
  user_id: number
  category_id: number
  title: string
  feed_url: string
  site_url: string
  checked_at: string
  etag_header: string
  last_modified_header: string
  parsing_error_count: number
  parsing_error_message: string
  scraper_rules: string
  rewrite_rules: string
  crawler: boolean
  blocklist_rules: string
  keeplist_rules: string
  urlrewrite_rules: string
  ignore_http_cache: boolean
  allow_self_signed_certificates: boolean
  fetch_via_proxy: boolean
  disabled: boolean
  no_media_player: boolean
  hide_globally: boolean
  user_agent: string
  cookie: string
  username: string
  password: string
  icon: {
    id: string
    mime_type: string
    data: string
  }
  icon_id: string
  icon_mime_type: string
  icon_content_hash: string
  icon_last_checked_at: string
  icon_last_error_at: string
  created_at: string
  updated_at: string
}

export interface FeedWithCount extends Feed {
  category: Category
  unread_count: number
  reading_time: number
}

// Entry types
export interface Entry {
  id: number
  user_id: number
  feed_id: number
  status: string
  hashing: string
  published_at: string
  title: string
  url: string
  author: string
  content: string
  length: number
  reading_time: number
  created_at: string
  starred: boolean
  enclosure_url: string
  enclosure_mime_type: string
  enclosure_length: number
  comments_url: string
  feed: Feed
  tags: string[]
}

export interface EntryListResponse {
  total: number
  entries: Entry[]
}

export interface EntryFilter {
  status?: 'read' | 'unread' | 'removed'
  state?: 'all' | 'starred' | 'unread'
  feed_id?: number
  category_id?: number
  before?: number
  after?: number
  before_entry_id?: number
  after_entry_id?: number
  limit?: number
  offset?: number
  order?: string
  direction?: string
  search?: string
}

// API Response types
export interface LoginRequest {
  username: string
  password: string
}

export interface CreateCategoryRequest {
  title: string
}

export interface UpdateCategoryRequest {
  title: string
}

export interface CreateFeedRequest {
  feed_url: string
  category_id?: number
  crawler?: boolean
  user_agent?: string
  username?: string
  password?: string
  scraper_rules?: string
  rewrite_rules?: string
  blocklist_rules?: string
  keeplist_rules?: string
}

export interface UpdateFeedRequest {
  feed_url?: string
  site_url?: string
  title?: string
  category_id?: number
  crawler?: boolean
  user_agent?: string
  username?: string
  password?: string
  scraper_rules?: string
  rewrite_rules?: string
  blocklist_rules?: string
  keeplist_rules?: string
  disabled?: boolean
}

export interface UpdateEntryRequest {
  status?: string
  starred?: boolean
}

// API Error types
export interface ApiError {
  message: string
  error_message: string
}
