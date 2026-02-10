<template>
  <div v-if="entry" class="reader-panel">
    <div class="reader-header">
      <div class="header-left">
        <el-button link @click="$emit('close')">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
      <div class="header-actions">
        <el-button link :disabled="!hasPrev" @click="$emit('prev')">
          <el-icon><ArrowUp /></el-icon>
        </el-button>
        <el-button link :disabled="!hasNext" @click="$emit('next')">
          <el-icon><ArrowDown /></el-icon>
        </el-button>
        <el-button
          link
          :class="{ starred: entry.starred }"
          @click="toggleStar"
        >
          <el-icon>
            <StarFilled v-if="entry.starred" />
            <Star v-else />
          </el-icon>
        </el-button>
        <el-button link @click="openExternal">
          <el-icon><TopRight /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="reader-content">
      <h1 class="entry-title">{{ entry.title }}</h1>

      <div class="entry-meta">
        <div class="meta-item">
          <img
            v-if="entry.feed.icon"
            :src="`data:${entry.feed.icon.mime_type};base64,${entry.feed.icon.data}`"
            class="feed-icon"
            alt=""
          />
          <span>{{ entry.feed.title }}</span>
        </div>
        <div class="meta-item">
          <el-icon><Clock /></el-icon>
          <span>{{ formatDate(entry.published_at) }}</span>
        </div>
        <div v-if="entry.author" class="meta-item">
          <el-icon><User /></el-icon>
          <span>{{ entry.author }}</span>
        </div>
      </div>

      <el-divider />

      <div
        class="entry-body"
        :class="{ 'original-view': viewMode === 'original' }"
        v-html="entry.content"
      />
    </div>
  </div>

  <div v-else class="empty-state">
    <el-empty description="选择一篇文章开始阅读" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Star,
  StarFilled,
  TopRight,
  Clock,
  User,
} from '@element-plus/icons-vue'
import type { Entry } from '@/types'
import { useArticlesStore } from '@/stores/articles'

interface Props {
  entry: Entry | null
  hasPrev?: boolean
  hasNext?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hasPrev: false,
  hasNext: false,
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'prev'): void
  (e: 'next'): void
}>()

const articlesStore = useArticlesStore()
const viewMode = ref<'reader' | 'original'>('reader')

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function toggleStar() {
  if (props.entry) {
    articlesStore.toggleStar(props.entry.id, !props.entry.starred)
  }
}

function openExternal() {
  if (props.entry) {
    window.open(props.entry.url, '_blank')
  }
}
</script>

<style scoped>
.reader-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
}

.reader-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
}

.header-left .el-button {
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-actions .el-button.starred {
  color: #f6d86e;
}

.reader-content {
  flex: 1;
  padding: 32px 48px;
  overflow-y: auto;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.entry-title {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.entry-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
}

.feed-icon {
  width: 18px;
  height: 18px;
  border-radius: 2px;
}

.entry-body {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-primary);
}

.entry-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 16px 0;
}

.entry-body :deep(p) {
  margin-bottom: 16px;
}

.entry-body :deep(h1),
.entry-body :deep(h2),
.entry-body :deep(h3),
.entry-body :deep(h4) {
  margin-top: 24px;
  margin-bottom: 12px;
  font-weight: 600;
}

.entry-body :deep(h1) {
  font-size: 24px;
}

.entry-body :deep(h2) {
  font-size: 20px;
}

.entry-body :deep(h3) {
  font-size: 18px;
}

.entry-body :deep(a) {
  color: var(--el-color-primary);
  text-decoration: none;
}

.entry-body :deep(a:hover) {
  text-decoration: underline;
}

.entry-body :deep(blockquote) {
  border-left: 4px solid var(--el-color-primary);
  padding-left: 16px;
  margin: 16px 0;
  color: var(--text-secondary);
  font-style: italic;
}

.entry-body :deep(code) {
  background-color: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
}

.entry-body :deep(pre) {
  background-color: var(--bg-secondary);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

.entry-body :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.entry-body :deep(ul),
.entry-body :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.entry-body :deep(li) {
  margin-bottom: 8px;
}

.original-view {
  font-family: inherit;
  line-height: 1.6;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
}
</style>
