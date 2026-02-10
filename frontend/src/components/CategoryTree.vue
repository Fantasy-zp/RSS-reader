<template>
  <div class="category-tree">
    <div class="section-header">
      <span>分类</span>
      <el-icon class="add-icon" @click="showAddCategory = true">
        <Plus />
      </el-icon>
    </div>

    <div class="category-list">
      <div
        v-for="category in feedsStore.categories"
        :key="category.id"
        class="category-item"
        :class="{ active: selectedCategoryId === category.id }"
        @click="selectCategory(category.id)"
      >
        <el-icon><Folder /></el-icon>
        <span>{{ category.title }}</span>
      </div>

      <div
        class="category-item"
        :class="{ active: selectedCategoryId === null }"
        @click="selectCategory(null)"
      >
        <el-icon><Grid /></el-icon>
        <span>全部</span>
      </div>
    </div>

    <!-- Add Category Dialog -->
    <el-dialog v-model="showAddCategory" title="添加分类" width="400px">
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="categoryForm.title" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddCategory = false">取消</el-button>
        <el-button type="primary" @click="addCategory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus, Folder, Grid } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useFeedsStore } from '@/stores/feeds'
import { categoriesApi } from '@/api/categories'

const emit = defineEmits<{
  (e: 'select-category', id: number | null): void
}>()

const feedsStore = useFeedsStore()
const showAddCategory = ref(false)
const selectedCategoryId = ref<number | null>(null)

const categoryForm = reactive({
  title: '',
})

async function addCategory() {
  if (!categoryForm.title.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }

  try {
    await categoriesApi.create({ title: categoryForm.title })
    ElMessage.success('分类添加成功')
    showAddCategory.value = false
    categoryForm.title = ''
    await feedsStore.fetchCategories()
  } catch (error) {
    ElMessage.error('分类添加失败')
  }
}

function selectCategory(id: number | null) {
  selectedCategoryId.value = id
  emit('select-category', id)
}

onMounted(() => {
  feedsStore.fetchCategories()
})
</script>

<style scoped>
.category-tree {
  padding: 16px;
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

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

.category-item:hover {
  background-color: var(--bg-tertiary);
}

.category-item.active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.category-item .el-icon {
  font-size: 16px;
}
</style>
