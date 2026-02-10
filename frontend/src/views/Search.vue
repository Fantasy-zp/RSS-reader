<template>
  <div class="search-page">
    <div class="search-header">
      <el-button link @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>搜索文章</h1>
    </div>

    <div class="search-input-wrapper">
      <el-input
        v-model="searchQuery"
        size="large"
        placeholder="搜索关键词..."
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button :loading="loading" @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <div class="search-info">
      <el-alert
        type="info"
        :closable="false"
        show-icon
      >
        <template #title>
          中文搜索提示
        </template>
        <template #default>
          Miniflux 的全文搜索依赖 PostgreSQL 的全文检索功能。对于中文内容，需要在数据库中配置
          <code>pg_trgm</code> 扩展以获得更好的搜索效果。
        </template>
      </el-alert>
    </div>

    <div v-if="hasSearched" class="search-results">
      <div class="results-header">
        <h2>搜索结果 ({{ articlesStore.total }})</h2>
      </div>

      <div v-loading="loading" class="results-list">
        <ArticleCard
          v-for="entry in articlesStore.entries"
          :key="entry.id"
          :entry="entry"
          @click="handleEntryClick"
        />
      </div>

      <div v-if="!loading && articlesStore.entries.length === 0" class="empty">
        <el-empty description="没有找到匹配的文章" />
      </div>
    </div>
  </div>

  <ReaderPanel
    v-if="selectedEntry"
    :entry="selectedEntry"
    :has-prev="hasPrevEntry"
    :has-next="hasNextEntry"
    @close="selectedEntry = null"
    @prev="readPrev"
    @next="readNext"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, Search } from '@element-plus/icons-vue'
import { useArticlesStore } from '@/stores/articles'
import ArticleCard from '@/components/ArticleCard.vue'
import ReaderPanel from '@/components/ReaderPanel.vue'
import type { Entry } from '@/types'

const articlesStore = useArticlesStore()

const searchQuery = ref('')
const loading = ref(false)
const hasSearched = ref(false)
const selectedEntry = ref<Entry | null>(null)

const currentEntryIndex = computed(() => {
  if (!selectedEntry.value) return -1
  return articlesStore.entries.findIndex(e => e.id === selectedEntry.value!.id)
})

const hasPrevEntry = computed(() => currentEntryIndex.value > 0)
const hasNextEntry = computed(() => currentEntryIndex.value < articlesStore.entries.length - 1)

async function handleSearch() {
  if (!searchQuery.value.trim()) {
    return
  }

  loading.value = true
  hasSearched.value = true
  selectedEntry.value = null

  try {
    await articlesStore.fetchEntries({
      search: searchQuery.value,
      limit: 100,
    })
  } finally {
    loading.value = false
  }
}

function handleEntryClick(entry: Entry) {
  selectedEntry.value = entry
  articlesStore.markAsRead(entry.id)
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
</script>

<style scoped>
.search-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.search-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.search-input-wrapper {
  margin-bottom: 24px;
}

.search-info {
  margin-bottom: 24px;
}

.search-info code {
  background-color: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.search-results {
  min-height: 400px;
}

.results-header {
  margin-bottom: 16px;
}

.results-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.results-list {
  display: flex;
  flex-direction: column;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}
</style>
