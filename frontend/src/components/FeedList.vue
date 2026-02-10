<template>
  <div class="feed-list">
    <div class="section-header">
      <span>RSS 源</span>
      <el-icon class="add-icon" @click="showAddFeed = true">
        <Plus />
      </el-icon>
    </div>

    <div class="feeds">
      <div
        v-for="feed in filteredFeeds"
        :key="feed.id"
        class="feed-item"
        :class="{ active: selectedFeedId === feed.id }"
        @click="selectFeed(feed.id)"
      >
        <div class="feed-icon">
          <img v-if="feed.icon" :src="`data:${feed.icon.mime_type};base64,${feed.icon.data}`" alt="" />
          <el-icon v-else><Connection /></el-icon>
        </div>
        <div class="feed-info">
          <div class="feed-title">{{ feed.title }}</div>
          <div class="feed-meta">
            <span v-if="feed.unread_count > 0" class="unread-count">
              {{ feed.unread_count }} 未读
            </span>
          </div>
        </div>
        <el-dropdown trigger="click" @command="(cmd: string) => handleCommand(cmd, feed)">
          <el-icon class="more-icon"><MoreFilled /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="refresh">刷新</el-dropdown-item>
              <el-dropdown-item command="edit">编辑</el-dropdown-item>
              <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- Add Feed Dialog -->
    <el-dialog v-model="showAddFeed" title="添加 RSS 源" width="500px">
      <el-form :model="feedForm" label-width="100px">
        <el-form-item label="RSS 地址">
          <el-input v-model="feedForm.feed_url" placeholder="https://example.com/feed.xml" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="feedForm.category_id" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="category in feedsStore.categories"
              :key="category.id"
              :label="category.title"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddFeed = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="addFeed">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Connection, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFeedsStore } from '@/stores/feeds'
import { feedsApi } from '@/api/feeds'
import type { FeedWithStats } from '@/api/feeds'

interface Props {
  categoryId?: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select-feed', id: number): void
}>()

const feedsStore = useFeedsStore()
const showAddFeed = ref(false)
const selectedFeedId = ref<number | null>(null)
const loading = ref(false)

const feedForm = reactive({
  feed_url: '',
  category_id: props.categoryId || undefined,
})

const filteredFeeds = computed(() => {
  if (props.categoryId === null || props.categoryId === undefined) {
    return feedsStore.feeds
  }
  return feedsStore.feeds.filter(f => f.category_id === props.categoryId)
})

async function addFeed() {
  if (!feedForm.feed_url.trim()) {
    ElMessage.warning('请输入 RSS 地址')
    return
  }

  loading.value = true
  try {
    await feedsApi.create(feedForm)
    ElMessage.success('RSS 源添加成功')
    showAddFeed.value = false
    feedForm.feed_url = ''
    await feedsStore.fetchFeeds()
  } catch (error) {
    ElMessage.error('RSS 源添加失败')
  } finally {
    loading.value = false
  }
}

function selectFeed(id: number) {
  selectedFeedId.value = id
  emit('select-feed', id)
}

async function handleCommand(command: string, feed: FeedWithStats) {
  switch (command) {
    case 'refresh':
      await feedsStore.refreshFeed(feed.id)
      ElMessage.success('刷新成功')
      break
    case 'edit':
      ElMessage.info('编辑功能待实现')
      break
    case 'delete':
      try {
        await ElMessageBox.confirm('确定要删除这个 RSS 源吗？', '提示', {
          type: 'warning',
        })
        await feedsStore.deleteFeed(feed.id)
        ElMessage.success('删除成功')
      } catch {
        // User cancelled
      }
      break
  }
}

onMounted(() => {
  feedsStore.fetchFeeds()
})
</script>

<style scoped>
.feed-list {
  padding: 16px;
  border-top: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.add-icon {
  cursor: pointer;
  font-size: 16px;
}

.add-icon:hover {
  color: var(--el-color-primary);
}

.feeds {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 400px;
  overflow-y: auto;
}

.feed-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.feed-item:hover {
  background-color: var(--bg-tertiary);
}

.feed-item.active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.feed-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.feed-icon img {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.feed-icon .el-icon {
  font-size: 20px;
  color: var(--text-tertiary);
}

.feed-info {
  flex: 1;
  min-width: 0;
}

.feed-title {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feed-meta {
  font-size: 12px;
  color: var(--text-tertiary);
}

.unread-count {
  color: var(--el-color-primary);
}

.more-icon {
  font-size: 16px;
  color: var(--text-tertiary);
  padding: 4px;
  border-radius: 4px;
}

.more-icon:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}
</style>
