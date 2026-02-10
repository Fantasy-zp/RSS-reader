<template>
  <div class="dashboard">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>RSS 阅读器</h1>
        <el-button link class="logout-btn" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
        </el-button>
      </div>

      <div class="filter-tabs">
        <div
          class="tab-item"
          :class="{ active: currentFilter === 'all' }"
          @click="setFilter('all')"
        >
          全部
        </div>
        <div
          class="tab-item"
          :class="{ active: currentFilter === 'unread' }"
          @click="setFilter('unread')"
        >
          未读
        </div>
        <div
          class="tab-item"
          :class="{ active: currentFilter === 'starred' }"
          @click="setFilter('starred')"
        >
          收藏
        </div>
      </div>

      <CategoryTree @select-category="handleCategorySelect" />

      <FeedList :category-id="selectedCategoryId" @select-feed="handleFeedSelect" />

      <div class="sidebar-footer">
        <el-button link @click="$router.push('/settings')">
          <el-icon><Setting /></el-icon>
          设置
        </el-button>
      </div>
    </aside>

    <main class="main-content">
      <div v-if="!selectedEntry" class="article-list">
        <div class="list-header">
          <h2>{{ currentTitle }}</h2>
          <el-button
            v-if="articlesStore.entries.length > 0"
            link
            @click="markAllAsRead"
          >
            全部已读
          </el-button>
        </div>

        <div v-loading="articlesStore.loading" class="articles">
          <ArticleCard
            v-for="entry in articlesStore.entries"
            :key="entry.id"
            :entry="entry"
            @click="handleEntryClick"
          />
        </div>

        <div v-if="!articlesStore.loading && articlesStore.entries.length === 0" class="empty">
          <el-empty description="暂无文章" />
        </div>
      </div>

      <ReaderPanel
        v-else
        :entry="selectedEntry"
        :has-prev="hasPrevEntry"
        :has-next="hasNextEntry"
        @close="closeReader"
        @prev="readPrev"
        @next="readNext"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { SwitchButton, Setting } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useArticlesStore } from '@/stores/articles'
import { useFeedsStore } from '@/stores/feeds'
import CategoryTree from '@/components/CategoryTree.vue'
import FeedList from '@/components/FeedList.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import ReaderPanel from '@/components/ReaderPanel.vue'
import type { Entry } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const articlesStore = useArticlesStore()
const feedsStore = useFeedsStore()

const currentFilter = ref<'all' | 'unread' | 'starred'>('all')
const selectedCategoryId = ref<number | null>(null)
const selectedFeedId = ref<number | null>(null)
const selectedEntry = ref<Entry | null>(null)

const currentTitle = computed(() => {
  if (selectedFeedId.value) {
    const feed = feedsStore.getFeedById(selectedFeedId.value)
    return feed?.title || 'RSS 源'
  }
  if (selectedCategoryId.value) {
    const category = feedsStore.getCategoryById(selectedCategoryId.value)
    return category?.title || '分类'
  }
  switch (currentFilter.value) {
    case 'unread':
      return '未读文章'
    case 'starred':
      return '收藏文章'
    default:
      return '全部文章'
  }
})

const currentEntryIndex = computed(() => {
  if (!selectedEntry.value) return -1
  return articlesStore.entries.findIndex(e => e.id === selectedEntry.value!.id)
})

const hasPrevEntry = computed(() => currentEntryIndex.value > 0)
const hasNextEntry = computed(() => currentEntryIndex.value < articlesStore.entries.length - 1)

async function loadEntries() {
  const filter: {
    status?: 'read' | 'unread'
    starred?: boolean
    feed_id?: number
  } = {}

  switch (currentFilter.value) {
    case 'unread':
      filter.status = 'unread'
      break
    case 'starred':
      filter.starred = true
      break
  }

  if (selectedFeedId.value) {
    filter.feed_id = selectedFeedId.value
  }

  await articlesStore.fetchEntries(filter)
}

function setFilter(filter: 'all' | 'unread' | 'starred') {
  currentFilter.value = filter
  selectedCategoryId.value = null
  selectedFeedId.value = null
  selectedEntry.value = null
  loadEntries()
}

function handleCategorySelect(id: number | null) {
  selectedCategoryId.value = id
  selectedFeedId.value = null
  selectedEntry.value = null
  loadEntries()
}

function handleFeedSelect(id: number) {
  selectedFeedId.value = id
  selectedEntry.value = null
  loadEntries()
}

function handleEntryClick(entry: Entry) {
  selectedEntry.value = entry
}

function closeReader() {
  selectedEntry.value = null
}

function readPrev() {
  if (hasPrevEntry.value) {
    const entry = articlesStore.entries[currentEntryIndex.value - 1]
    if (entry) {
      selectedEntry.value = entry
      articlesStore.markAsRead(entry.id)
    }
  }
}

function readNext() {
  if (hasNextEntry.value) {
    const entry = articlesStore.entries[currentEntryIndex.value + 1]
    if (entry) {
      selectedEntry.value = entry
      articlesStore.markAsRead(entry.id)
    }
  }
}

async function markAllAsRead() {
  try {
    await ElMessageBox.confirm('确定要将所有文章标记为已读吗？', '提示', {
      type: 'warning',
    })
    const filter: { feed_id?: number } = {}
    if (selectedFeedId.value) {
      filter.feed_id = selectedFeedId.value
    }
    await articlesStore.markAllAsRead(filter)
    await loadEntries()
    await feedsStore.fetchFeeds()
    ElMessage.success('已标记为已读')
  } catch {
    // User cancelled
  }
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning',
    })
    authStore.logout()
    router.push('/login')
  } catch {
    // User cancelled
  }
}

onMounted(() => {
  loadEntries()
  feedsStore.fetchCategories()
  feedsStore.fetchFeeds()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.logout-btn {
  font-size: 18px;
}

.filter-tabs {
  display: flex;
  padding: 8px 16px;
  gap: 8px;
  border-bottom: 1px solid var(--border-color);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
}

.tab-item:hover {
  background-color: var(--bg-tertiary);
}

.tab-item.active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 500;
}

.sidebar-footer {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid var(--border-color);
}

.sidebar-footer .el-button {
  width: 100%;
  justify-content: flex-start;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-primary);
}

.article-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
}

.list-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.articles {
  flex: 1;
  overflow-y: auto;
}

.empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
