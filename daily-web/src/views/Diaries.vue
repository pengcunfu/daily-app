<template>
  <div class="diaries">
    <!-- 搜索和筛选 -->
    <div class="content-card mb-20">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.search"
            placeholder="搜索标题/内容/地点"
            clearable
            style="width: 240px"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="心情">
          <el-select v-model="searchForm.mood" placeholder="选择心情" clearable>
            <el-option label="非常开心" value="very_happy">
              <span style="font-size: 18px">😄</span> 非常开心
            </el-option>
            <el-option label="开心" value="happy">
              <span style="font-size: 18px">😊</span> 开心
            </el-option>
            <el-option label="平静" value="normal">
              <span style="font-size: 18px">😐</span> 平静
            </el-option>
            <el-option label="难过" value="sad">
              <span style="font-size: 18px">😢</span> 难过
            </el-option>
            <el-option label="非常难过" value="very_sad">
              <span style="font-size: 18px">😭</span> 非常难过
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 260px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            写日记
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 日记列表表格 -->
    <div class="content-card">
      <el-table :data="diaryList" v-loading="loading" stripe>
        <el-table-column prop="title" label="标题" width="300" show-overflow-tooltip />
        
        <el-table-column prop="date" label="日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="mood" label="心情" width="120">
          <template #default="{ row }">
            <span v-if="row.mood" class="mood-icon">
              {{ getMoodIcon(row.mood) }} {{ getMoodText(row.mood) }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="weather" label="天气" width="100">
          <template #default="{ row }">
            {{ row.weather || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="location" label="地点" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.location || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="tags" label="标签" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="tag in parseJson(row.tags).slice(0, 3)"
              :key="tag"
              size="small"
              style="margin-right: 4px"
            >
              {{ tag }}
            </el-tag>
            <span v-if="parseJson(row.tags).length > 3">...</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="isPrivate" label="隐私" width="80">
          <template #default="{ row }">
            <el-icon v-if="row.isPrivate" style="color: #f56c6c"><Lock /></el-icon>
            <el-icon v-else style="color: #67c23a"><Unlock /></el-icon>
          </template>
        </el-table-column>
        
        <el-table-column prop="content" label="内容预览" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.content.substring(0, 100) }}{{ row.content.length > 100 ? '...' : '' }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleView(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button type="primary" size="small" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="!loading && diaryList.length === 0" description="暂无日记数据" />
      
      <!-- 分页 -->
      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadDiaries"
          @current-change="loadDiaries"
        />
      </div>
    </div>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="日记详情"
      width="800px"
    >
      <div v-if="currentDiary" class="diary-detail">
        <div class="detail-header">
          <h2>{{ currentDiary.title }}</h2>
          <div class="meta-info">
            <el-tag type="info" size="small">
              <el-icon><Calendar /></el-icon>
              {{ formatDateTime(currentDiary.date) }}
            </el-tag>
            <el-tag v-if="currentDiary.mood" type="success" size="small" style="margin-left: 8px">
              {{ getMoodIcon(currentDiary.mood) }} {{ getMoodText(currentDiary.mood) }}
            </el-tag>
            <el-tag v-if="currentDiary.weather" type="warning" size="small" style="margin-left: 8px">
              {{ currentDiary.weather }}
            </el-tag>
            <el-tag v-if="currentDiary.location" size="small" style="margin-left: 8px">
              <el-icon><Location /></el-icon>
              {{ currentDiary.location }}
            </el-tag>
          </div>
        </div>
        
        <div class="detail-content">
          <div class="content-text">{{ currentDiary.content }}</div>
          
          <div v-if="parseJson(currentDiary.images).length > 0" class="images-gallery">
            <el-image
              v-for="(img, index) in parseJson(currentDiary.images)"
              :key="index"
              :src="img"
              :preview-src-list="parseJson(currentDiary.images)"
              fit="cover"
              class="gallery-image"
            />
          </div>
          
          <div v-if="parseJson(currentDiary.tags).length > 0" class="tags-list">
            <el-tag
              v-for="tag in parseJson(currentDiary.tags)"
              :key="tag"
              size="small"
              style="margin-right: 8px; margin-bottom: 8px"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入日记标题" maxlength="200" show-word-limit />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="日期" prop="date">
              <el-date-picker
                v-model="formData.date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="心情">
              <el-select v-model="formData.mood" placeholder="选择心情">
                <el-option label="😄 非常开心" value="very_happy" />
                <el-option label="😊 开心" value="happy" />
                <el-option label="😐 平静" value="normal" />
                <el-option label="😢 难过" value="sad" />
                <el-option label="😭 非常难过" value="very_sad" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="天气">
              <el-input v-model="formData.weather" placeholder="如:晴天" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="地点">
          <el-input v-model="formData.location" placeholder="请输入地点" maxlength="200" />
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="12"
            placeholder="记录今天发生的事情..."
            maxlength="10000"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="图片">
          <el-upload
            ref="uploadRef"
            :file-list="fileList"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :before-upload="beforeUpload"
            :auto-upload="false"
            multiple
            accept="image/*"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="标签">
          <el-tag
            v-for="tag in formData.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
            style="margin-right: 8px; margin-bottom: 8px"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="tagInputVisible"
            ref="tagInputRef"
            v-model="tagInputValue"
            size="small"
            @keyup.enter="handleTagInputConfirm"
            @blur="handleTagInputConfirm"
            style="width: 100px"
          />
          <el-button v-else size="small" @click="showTagInput">+ 添加标签</el-button>
        </el-form-item>
        
        <el-form-item label="隐私设置">
          <el-switch
            v-model="formData.isPrivate"
            active-text="私密"
            inactive-text="公开"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, View, Edit, Delete, Calendar, Location, Lock, Unlock } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import {
  getDiaryList,
  createDiary,
  updateDiary,
  deleteDiary
} from '@/api/diaries'
import { uploadAppearancePhotos } from '@/api/appearance'

const loading = ref(false)
const diaryList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const dateRange = ref([])

// 搜索表单
const searchForm = ref({
  search: '',
  mood: '',
  startDate: '',
  endDate: ''
})

// 对话框相关
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const dialogTitle = computed(() => isEdit.value ? '编辑日记' : '写日记')
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const currentDiary = ref(null)
const fileList = ref([])

// 标签输入
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref(null)

// 表单数据
const formData = ref({
  title: '',
  content: '',
  date: new Date(),
  mood: 'normal',
  weather: '',
  location: '',
  images: [],
  tags: [],
  isPrivate: true
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入日记标题', trigger: 'blur' },
    { min: 1, max: 200, message: '标题长度在 1 到 200 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入日记内容', trigger: 'blur' },
    { min: 1, max: 10000, message: '内容长度在 1 到 10000 个字符', trigger: 'blur' }
  ],
  date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ]
}

// 心情图标和文本
const moodMap = {
  very_happy: { icon: '😄', text: '非常开心' },
  happy: { icon: '😊', text: '开心' },
  normal: { icon: '😐', text: '平静' },
  sad: { icon: '😢', text: '难过' },
  very_sad: { icon: '😭', text: '非常难过' }
}

const getMoodIcon = (mood) => moodMap[mood]?.icon || ''
const getMoodText = (mood) => moodMap[mood]?.text || mood

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const formatDateTime = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 解析 JSON
const parseJson = (jsonStr) => {
  if (!jsonStr) return []
  try {
    return typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
  } catch {
    return []
  }
}

// 加载日记列表
const loadDiaries = async () => {
  try {
    loading.value = true
    
    // 处理日期范围
    if (dateRange.value && dateRange.value.length === 2) {
      searchForm.value.startDate = formatDate(dateRange.value[0])
      searchForm.value.endDate = formatDate(dateRange.value[1])
    } else {
      searchForm.value.startDate = ''
      searchForm.value.endDate = ''
    }
    
    const res = await getDiaryList({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value
    })
    
    if (res.success) {
      diaryList.value = res.data.list
      total.value = res.data.pagination.total
    } else {
      ElMessage.error(res.message || '获取日记列表失败')
    }
  } catch (error) {
    console.error('获取日记列表失败:', error)
    ElMessage.error('获取日记列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadDiaries()
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    search: '',
    mood: '',
    startDate: '',
    endDate: ''
  }
  dateRange.value = []
  handleSearch()
}

// 新增日记
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 查看详情
const handleView = (row) => {
  currentDiary.value = row
  viewDialogVisible.value = true
}

// 编辑日记
const handleEdit = (row) => {
  isEdit.value = true
  currentDiary.value = row
  
  // 填充表单数据
  formData.value = {
    title: row.title,
    content: row.content,
    date: row.date ? new Date(row.date) : new Date(),
    mood: row.mood || 'normal',
    weather: row.weather || '',
    location: row.location || '',
    images: parseJson(row.images),
    tags: parseJson(row.tags),
    isPrivate: row.isPrivate
  }
  
  // 设置文件列表
  fileList.value = parseJson(row.images).map((url, index) => ({
    uid: index,
    name: `image-${index}`,
    url
  }))
  
  dialogVisible.value = true
}

// 删除日记
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除日记 "${row.title}" 吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    const res = await deleteDiary(row.id)
    if (res.success) {
      ElMessage.success('删除成功')
      loadDiaries()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 文件上传处理
const handleFileChange = (file, uploadFileList) => {
  if (uploadFileList.length > 9) {
    ElMessage.warning('最多只能上传9张图片')
    uploadFileList.pop()
    return false
  }
}

const handleFileRemove = (file, uploadFileList) => {
  fileList.value = uploadFileList
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过10MB!')
    return false
  }
  return true
}

// 标签处理
const removeTag = (tag) => {
  const index = formData.value.tags.indexOf(tag)
  if (index > -1) {
    formData.value.tags.splice(index, 1)
  }
}

const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.input?.focus()
  })
}

const handleTagInputConfirm = () => {
  if (tagInputValue.value && !formData.value.tags.includes(tagInputValue.value)) {
    formData.value.tags.push(tagInputValue.value)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      submitLoading.value = true
      
      // 上传图片
      const imageUrls = []
      
      for (const file of fileList.value) {
        if (file.raw) {
          // 新上传的文件
          const formDataUpload = new FormData()
          formDataUpload.append('photos', file.raw)
          
          const uploadResponse = await uploadAppearancePhotos(formDataUpload)
          if (uploadResponse.success) {
            imageUrls.push(...uploadResponse.data.map(item => item.url))
          }
        } else {
          // 已存在的文件
          imageUrls.push(file.url)
        }
      }
      
      const submitData = {
        title: formData.value.title,
        content: formData.value.content,
        date: formData.value.date,
        mood: formData.value.mood || undefined,
        weather: formData.value.weather || undefined,
        location: formData.value.location || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        tags: formData.value.tags.length > 0 ? formData.value.tags : undefined,
        isPrivate: formData.value.isPrivate
      }
      
      let res
      if (isEdit.value) {
        res = await updateDiary(currentDiary.value.id, submitData)
      } else {
        res = await createDiary(submitData)
      }
      
      if (res.success) {
        ElMessage.success(isEdit.value ? '更新日记成功' : '创建日记成功')
        handleCancel()
        loadDiaries()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error('操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 取消
const handleCancel = () => {
  dialogVisible.value = false
  currentDiary.value = null
  resetForm()
}

// 重置表单
const resetForm = () => {
  formData.value = {
    title: '',
    content: '',
    date: new Date(),
    mood: 'normal',
    weather: '',
    location: '',
    images: [],
    tags: [],
    isPrivate: true
  }
  fileList.value = []
  formRef.value?.resetFields()
}

// 初始化
onMounted(() => {
  loadDiaries()
})
</script>

<style lang="scss" scoped>
.diaries {
  .search-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }
  
  .mood-icon {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  .diary-detail {
    .detail-header {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #eee;
      
      h2 {
        margin: 0 0 12px 0;
        font-size: 24px;
        color: #333;
      }
      
      .meta-info {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
    
    .detail-content {
      .content-text {
        line-height: 1.8;
        font-size: 15px;
        color: #333;
        white-space: pre-wrap;
        word-wrap: break-word;
        margin-bottom: 20px;
      }
      
      .images-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
        margin-bottom: 20px;
        
        .gallery-image {
          width: 100%;
          height: 150px;
          border-radius: 8px;
          cursor: pointer;
        }
      }
      
      .tags-list {
        padding-top: 12px;
        border-top: 1px solid #eee;
      }
    }
  }
}

.mb-20 {
  margin-bottom: 20px;
}
</style>

