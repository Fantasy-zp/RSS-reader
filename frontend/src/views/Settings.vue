<template>
  <div class="settings-page">
    <div class="settings-header">
      <el-button link @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1>设置</h1>
    </div>

    <div class="settings-content">
      <el-card class="settings-section">
        <template #header>
          <div class="card-header">
            <el-icon><User /></el-icon>
            <span>个人信息</span>
          </div>
        </template>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户名">
            {{ authStore.user?.username }}
          </el-descriptions-item>
          <el-descriptions-item label="管理员">
            <el-tag :type="authStore.isAdmin ? 'success' : 'info'">
              {{ authStore.isAdmin ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="时区">
            {{ authStore.user?.timezone || 'UTC' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="settings-section">
        <template #header>
          <div class="card-header">
            <el-icon><Setting /></el-icon>
            <span>显示设置</span>
          </div>
        </template>

        <el-form label-width="120px">
          <el-form-item label="主题模式">
            <el-radio-group v-model="themeMode">
              <el-radio-button value="auto">
                跟随系统
              </el-radio-button>
              <el-radio-button value="light">
                浅色
              </el-radio-button>
              <el-radio-button value="dark">
                深色
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="文章密度">
            <el-radio-group v-model="articleDensity">
              <el-radio-button value="comfortable">
                舒适
              </el-radio-button>
              <el-radio-button value="compact">
                紧凑
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="settings-section">
        <template #header>
          <div class="card-header">
            <el-icon><Download /></el-icon>
            <span>数据管理</span>
          </div>
        </template>

        <div class="data-actions">
          <el-button @click="handleExportOPML">
            <el-icon><Download /></el-icon>
            导出 OPML
          </el-button>
          <el-button @click="showImportDialog = true">
            <el-icon><Upload /></el-icon>
            导入 OPML
          </el-button>
          <el-button type="danger" @click="handleRefreshAll">
            <el-icon><Refresh /></el-icon>
            刷新全部订阅
          </el-button>
        </div>
      </el-card>

      <el-card class="settings-section">
        <template #header>
          <div class="card-header">
            <el-icon><InfoFilled /></el-icon>
            <span>关于</span>
          </div>
        </template>

        <div class="about-info">
          <p><strong>RSS 阅读器</strong></p>
          <p>基于 Miniflux API 的 Web 版 RSS 阅读器</p>
          <p>版本: 1.0.0</p>
        </div>
      </el-card>
    </div>

    <!-- Import OPML Dialog -->
    <el-dialog v-model="showImportDialog" title="导入 OPML" width="500px">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :limit="1"
        accept=".opml,.xml"
        :on-change="handleFileChange"
      >
        <el-button type="primary">选择文件</el-button>
        <template #tip>
          <div class="el-upload__tip">
            支持 .opml 或 .xml 格式的文件
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" :loading="importing" @click="handleImportOPML">
          导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ArrowLeft, User, Setting, Download, Upload, Refresh, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFile, UploadInstance } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useFeedsStore } from '@/stores/feeds'
import { feedsApi } from '@/api/feeds'
import axios from 'axios'

const authStore = useAuthStore()
const feedsStore = useFeedsStore()

const themeMode = ref<'auto' | 'light' | 'dark'>('auto')
const articleDensity = ref<'comfortable' | 'compact'>('comfortable')
const showImportDialog = ref(false)
const importing = ref(false)
const uploadRef = ref<UploadInstance>()
const selectedFile = ref<File | null>(null)

// Theme management
watch(themeMode, (newMode) => {
  const html = document.documentElement

  if (newMode === 'auto') {
    html.removeAttribute('data-theme')
  } else {
    html.setAttribute('data-theme', newMode)
  }

  // Apply Element Plus dark mode
  if (newMode === 'dark' || (newMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }

  localStorage.setItem('theme_mode', newMode)
})

// Article density
watch(articleDensity, (density) => {
  document.body.setAttribute('data-density', density)
  localStorage.setItem('article_density', density)
})

function handleFileChange(file: UploadFile) {
  if (file.raw) {
    selectedFile.value = file.raw
  }
}

async function handleImportOPML() {
  if (!selectedFile.value) {
    ElMessage.warning('请选择文件')
    return
  }

  importing.value = true
  try {
    const text = await selectedFile.value.text()
    const opmlData = parseOPML(text)

    let successCount = 0
    let failCount = 0

    for (const feed of opmlData) {
      try {
        await feedsApi.create({
          feed_url: feed.url,
          category_id: undefined,
        })
        successCount++
      } catch {
        failCount++
      }
    }

    await feedsStore.fetchFeeds()
    showImportDialog.value = false

    ElMessage.success(`导入完成：成功 ${successCount} 个，失败 ${failCount} 个`)
  } catch (error) {
    ElMessage.error('导入失败，请检查文件格式')
  } finally {
    importing.value = false
  }
}

function parseOPML(text: string): Array<{ title: string; url: string }> {
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/xml')
  const feeds: Array<{ title: string; url: string }> = []

  const outlineElements = doc.querySelectorAll('outline[type="rss"], outline[xmlUrl]')

  outlineElements.forEach(el => {
    const title = el.getAttribute('title') || el.getAttribute('text') || ''
    const url = el.getAttribute('xmlUrl') || el.getAttribute('htmlUrl') || ''

    if (url) {
      feeds.push({ title, url })
    }
  })

  return feeds
}

async function handleExportOPML() {
  const feeds = feedsStore.feeds
  const categories = feedsStore.categories

  let opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>RSS Reader Subscriptions</title>
    <dateCreated>${new Date().toISOString()}</dateCreated>
  </head>
  <body>
`

  // Group feeds by category
  const categoryMap = new Map<number, typeof feeds>()
  categories.forEach(cat => {
    categoryMap.set(cat.id, feeds.filter(f => f.category_id === cat.id))
  })

  // Uncategorized feeds
  const uncategorizedFeeds = feeds.filter(f => !f.category_id)
  if (uncategorizedFeeds.length > 0) {
    uncategorizedFeeds.forEach(feed => {
      opml += `    <outline type="rss" text="${feed.title}" title="${feed.title}" xmlUrl="${feed.feed_url}" htmlUrl="${feed.site_url}" />\n`
    })
  }

  // Categorized feeds
  categoryMap.forEach((feeds, catId) => {
    const category = categories.find(c => c.id === catId)
    if (!category || feeds.length === 0) return

    opml += `    <outline text="${category.title}" title="${category.title}">\n`
    feeds.forEach(feed => {
      opml += `      <outline type="rss" text="${feed.title}" title="${feed.title}" xmlUrl="${feed.feed_url}" htmlUrl="${feed.site_url}" />\n`
    })
    opml += `    </outline>\n`
  })

  opml += `  </body>
</opml>`

  const blob = new Blob([opml], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.opml`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('导出成功')
}

async function handleRefreshAll() {
  try {
    await ElMessageBox.confirm('确定要刷新全部订阅源吗？这可能需要一些时间。', '提示', {
      type: 'warning',
    })

    await feedsApi.refreshAll()
    await feedsStore.fetchFeeds()

    ElMessage.success('刷新命令已发送，请稍后刷新查看结果')
  } catch {
    // User cancelled
  }
}

onMounted(() => {
  // Load saved settings
  const savedTheme = localStorage.getItem('theme_mode') as 'auto' | 'light' | 'dark' | null
  if (savedTheme) {
    themeMode.value = savedTheme
  }

  const savedDensity = localStorage.getItem('article_density') as 'comfortable' | 'compact' | null
  if (savedDensity) {
    articleDensity.value = savedDensity
    document.body.setAttribute('data-density', savedDensity)
  }
})
</script>

<style scoped>
.settings-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.settings-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-section {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.data-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.about-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.about-info strong {
  color: var(--text-primary);
}
</style>
