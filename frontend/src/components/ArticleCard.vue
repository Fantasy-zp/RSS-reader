<template>
  <article
    class="article-card"
    :class="{ unread: entry.status === 'unread', starred: entry.starred }"
    @click="handleClick"
  >
    <div class="article-header">
      <div class="feed-info">
        <img
          v-if="entry.feed.icon"
          :src="`data:${entry.feed.icon.mime_type};base64,${entry.feed.icon.data}`"
          class="feed-icon"
          alt=""
        />
        <span class="feed-name">{{ entry.feed.title }}</span>
      </div>
      <div class="article-meta">
        <span class="article-time">{{ formatTime(entry.published_at) }}</span>
      </div>
    </div>

    <h3 class="article-title">{{ entry.title }}</h3>

    <p v-if="showContent" class="article-content">{{ getSummary(entry.content) }}</p>

    <div class="article-footer">
      <div class="article-actions">
        <el-icon
          class="action-icon"
          :class="{ starred: entry.starred }"
          @click.stop="toggleStar"
        >
          <StarFilled v-if="entry.starred" />
          <Star v-else />
        </el-icon>
        <el-icon class="action-icon" @click.stop="toggleReadStatus">
          <View v-if="entry.status === 'unread'" />
          <Hide v-else />
        </el-icon>
        <el-icon class="action-icon" @click.stop="openExternal">
          <TopRight />
        </el-icon>
      </div>
      <span v-if="entry.reading_time > 0" class="reading-time">
        {{ entry.reading_time }} 分钟
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Star, StarFilled, View, Hide, TopRight } from '@element-plus/icons-vue'
import type { Entry } from '@/types'
import { useArticlesStore } from '@/stores/articles'

interface Props {
  entry: Entry
  showContent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showContent: true,
})

const emit = defineEmits<{
  (e: 'click', entry: Entry): void
}>()

const articlesStore = useArticlesStore()

function getSummary(content: string) {
  const div = document.createElement('div')
  div.innerHTML = content
  const text = div.textContent || div.innerText || ''
  return text.slice(0, 200) + (text.length > 200 ? '...' : '')
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 1 ? '刚刚' : `${minutes} 分钟前`
    }
    return `${hours} 小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days} 天前`
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

function handleClick() {
  emit('click', props.entry)
  if (props.entry.status === 'unread') {
    articlesStore.markAsRead(props.entry.id)
  }
}

function toggleStar() {
  articlesStore.toggleStar(props.entry.id, !props.entry.starred)
}

function toggleReadStatus() {
  if (props.entry.status === 'unread') {
    articlesStore.markAsRead(props.entry.id)
  } else {
    articlesStore.markAsUnread(props.entry.id)
  }
}

function openExternal() {
  window.open(props.entry.url, '_blank')
}
</script>

<style scoped>
.article-card {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.2s;
}

.article-card:hover {
  background-color: var(--bg-secondary);
}

.article-card.unread {
  background-color: var(--bg-primary);
}

.article-card.unread .article-title {
  font-weight: 600;
  color: var(--text-primary);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.feed-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.feed-icon {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.feed-name {
  font-size: 12px;
  color: var(--text-tertiary);
}

.article-meta {
  display: flex;
  gap: 8px;
}

.article-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.article-title {
  font-size: 16px;
  margin-bottom: 8px;
  color: var(--text-primary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-content {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-actions {
  display: flex;
  gap: 8px;
}

.action-icon {
  font-size: 18px;
  color: var(--text-tertiary);
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-icon:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.action-icon.starred {
  color: #f6d86e;
}

.reading-time {
  font-size: 12px;
  color: var(--text-tertiary);
}
</style>
