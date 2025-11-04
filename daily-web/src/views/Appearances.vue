<template>
  <div class="appearances">
    <!-- 搜索和筛选 -->
    <div class="content-card mb-20">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.search"
            placeholder="搜索标题或描述"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="心情">
          <el-select v-model="searchForm.mood" placeholder="选择心情" clearable>
            <el-option label="开心" value="开心" />
            <el-option label="平静" value="平静" />
            <el-option label="兴奋" value="兴奋" />
            <el-option label="疲惫" value="疲惫" />
            <el-option label="焦虑" value="焦虑" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="天气">
          <el-select v-model="searchForm.weather" placeholder="选择天气" clearable>
            <el-option label="晴天" value="晴天" />
            <el-option label="多云" value="多云" />
            <el-option label="阴天" value="阴天" />
            <el-option label="雨天" value="雨天" />
            <el-option label="雪天" value="雪天" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="评分">
          <el-select v-model="searchForm.rating" placeholder="选择评分" clearable>
            <el-option label="5分" :value="5" />
            <el-option label="4分" :value="4" />
            <el-option label="3分" :value="3" />
            <el-option label="2分" :value="2" />
            <el-option label="1分" :value="1" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            添加记录
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 形象记录列表 -->
    <div class="content-card">
      <div v-loading="loading" class="appearances-grid">
        <div
          v-for="item in appearanceList"
          :key="item.id"
          class="appearance-card"
        >
          <div class="card-header">
            <h3>{{ item.title }}</h3>
            <el-dropdown @command="(command) => handleCommand(command, item)">
              <el-button type="text" size="small">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <div class="card-photos">
            <el-image
              v-for="(photo, index) in item.photos.slice(0, 4)"
              :key="index"
              :src="photo"
              fit="cover"
              class="photo-item"
              :preview-src-list="item.photos"
            />
            <div v-if="item.photos.length > 4" class="more-photos">
              +{{ item.photos.length - 4 }}
            </div>
          </div>
          
          <div class="card-content">
            <p class="description" v-if="item.description">{{ item.description }}</p>
            
            <div class="meta-tags">
              <el-tag v-if="item.mood" size="small" type="success">{{ item.mood }}</el-tag>
              <el-tag v-if="item.weather" size="small" type="info">{{ item.weather }}</el-tag>
              <el-tag v-if="item.occasion" size="small" type="warning">{{ item.occasion }}</el-tag>
            </div>
            
            <div class="card-footer">
              <el-rate v-if="item.rating" v-model="item.rating" disabled size="small" />
              <span class="date">{{ formatDate(item.createdAt) }}</span>
            </div>
          </div>
        </div>
        
        <el-empty v-if="!loading && appearanceList.length === 0" description="暂无形象记录" />
      </div>
      
      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          :page-sizes="[12, 24, 48, 96]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingItem ? '编辑形象记录' : '添加形象记录'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        
        <el-form-item label="照片" prop="photos">
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
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="心情">
              <el-select v-model="form.mood" placeholder="选择心情">
                <el-option label="开心" value="开心" />
                <el-option label="平静" value="平静" />
                <el-option label="兴奋" value="兴奋" />
                <el-option label="疲惫" value="疲惫" />
                <el-option label="焦虑" value="焦虑" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="天气">
              <el-select v-model="form.weather" placeholder="选择天气">
                <el-option label="晴天" value="晴天" />
                <el-option label="多云" value="多云" />
                <el-option label="阴天" value="阴天" />
                <el-option label="雨天" value="雨天" />
                <el-option label="雪天" value="雪天" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="评分">
              <el-rate v-model="form.rating" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="场合">
          <el-input v-model="form.occasion" placeholder="请输入场合" />
        </el-form-item>
        
        <el-form-item label="标签">
          <el-tag
            v-for="tag in form.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
            class="tag-item"
          >
            {{ tag }}
          </el-tag>
          
          <el-input
            v-if="inputVisible"
            ref="inputRef"
            v-model="inputValue"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
            class="tag-input"
          />
          
          <el-button v-else size="small" @click="showInput">+ 添加标签</el-button>
        </el-form-item>
        
        <el-form-item label="隐私">
          <el-switch v-model="form.isPrivate" active-text="私密" inactive-text="公开" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ submitting ? '保存中...' : '保存' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAppearances,
  createAppearance,
  updateAppearance,
  deleteAppearance,
  uploadAppearancePhotos
} from '@/api/appearance'
import dayjs from 'dayjs'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const showCreateDialog = ref(false)
const editingItem = ref(null)
const appearanceList = ref([])
const total = ref(0)
const fileList = ref([])
const inputVisible = ref(false)
const inputValue = ref('')

// 表单引用
const formRef = ref()
const uploadRef = ref()
const inputRef = ref()

// 搜索表单
const searchForm = reactive({
  search: '',
  mood: '',
  weather: '',
  rating: null
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 12
})

// 表单数据
const form = reactive({
  title: '',
  description: '',
  photos: [],
  mood: '',
  weather: '',
  occasion: '',
  rating: 0,
  tags: [],
  isPrivate: false
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' }
  ],
  photos: [
    { required: true, message: '请上传至少一张照片', trigger: 'change' }
  ]
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取形象记录列表
const fetchAppearances = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    // 过滤空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) {
        delete params[key]
      }
    })
    
    const response = await getAppearances(params)
    const { list, pagination: paginationData } = response.data
    
    appearanceList.value = list.map(item => ({
      ...item,
      photos: JSON.parse(item.photos || '[]')
    }))
    
    total.value = paginationData.total
  } catch (error) {
    console.error('获取形象记录失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchAppearances()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  searchForm.rating = null
  handleSearch()
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchAppearances()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  fetchAppearances()
}

// 下拉菜单命令处理
const handleCommand = (command, item) => {
  switch (command) {
    case 'edit':
      handleEdit(item)
      break
    case 'delete':
      handleDelete(item)
      break
  }
}

// 编辑
const handleEdit = (item) => {
  editingItem.value = item
  Object.keys(form).forEach(key => {
    if (key === 'tags') {
      form[key] = JSON.parse(item.tags || '[]')
    } else {
      form[key] = item[key] || ''
    }
  })
  
  // 设置文件列表
  fileList.value = item.photos.map((url, index) => ({
    uid: index,
    name: `photo-${index}`,
    url
  }))
  
  showCreateDialog.value = true
}

// 删除
const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除形象记录"${item.title}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteAppearance(item.id)
    ElMessage.success('删除成功')
    fetchAppearances()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 文件上传处理
const handleFileChange = (file, fileList) => {
  // 限制文件数量
  if (fileList.length > 10) {
    ElMessage.warning('最多只能上传10张照片')
    return false
  }
}

const handleFileRemove = (file, fileList) => {
  // 更新文件列表
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
  form.tags.splice(form.tags.indexOf(tag), 1)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value.input.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value && !form.tags.includes(inputValue.value)) {
    form.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

// 取消
const handleCancel = () => {
  showCreateDialog.value = false
  editingItem.value = null
  resetForm()
}

// 重置表单
const resetForm = () => {
  Object.keys(form).forEach(key => {
    if (key === 'tags') {
      form[key] = []
    } else if (key === 'rating') {
      form[key] = 0
    } else if (key === 'isPrivate') {
      form[key] = false
    } else {
      form[key] = ''
    }
  })
  fileList.value = []
  formRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        // 上传照片
        const photoUrls = []
        
        for (const file of fileList.value) {
          if (file.raw) {
            // 新上传的文件
            const formData = new FormData()
            formData.append('photos', file.raw)
            
            const uploadResponse = await uploadAppearancePhotos(formData)
            photoUrls.push(...uploadResponse.data.map(item => item.url))
          } else {
            // 已存在的文件
            photoUrls.push(file.url)
          }
        }
        
        const submitData = {
          ...form,
          photos: photoUrls,
          tags: form.tags.length > 0 ? form.tags : undefined
        }
        
        if (editingItem.value) {
          await updateAppearance(editingItem.value.id, submitData)
          ElMessage.success('更新成功')
        } else {
          await createAppearance(submitData)
          ElMessage.success('创建成功')
        }
        
        handleCancel()
        fetchAppearances()
      } catch (error) {
        console.error('提交失败:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 初始化
onMounted(() => {
  fetchAppearances()
})
</script>

<style lang="scss" scoped>
.appearances {
  .search-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }
  
  .appearances-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    
    .appearance-card {
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      overflow: hidden;
      transition: box-shadow 0.3s;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      .card-header {
        padding: 15px;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }
      }
      
      .card-photos {
        position: relative;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 2px;
        
        .photo-item {
          width: 100%;
          height: 120px;
        }
        
        .more-photos {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
      }
      
      .card-content {
        padding: 15px;
        
        .description {
          margin: 0 0 12px 0;
          color: #666;
          font-size: 14px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .meta-tags {
          margin-bottom: 12px;
          
          .el-tag {
            margin-right: 8px;
            margin-bottom: 4px;
          }
        }
        
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .date {
            color: #999;
            font-size: 12px;
          }
        }
      }
    }
  }
  
  .pagination-wrapper {
    margin-top: 20px;
    text-align: center;
  }
  
  .tag-item {
    margin-right: 8px;
    margin-bottom: 4px;
  }
  
  .tag-input {
    width: 90px;
    margin-right: 8px;
  }
}

@media (max-width: 768px) {
  .appearances {
    .search-form {
      .el-form-item {
        display: block;
        margin-bottom: 15px;
      }
    }
    
    .appearances-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
