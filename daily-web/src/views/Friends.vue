<template>
  <div class="friends">
    <!-- 搜索和筛选 -->
    <div class="content-card mb-20">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.search"
            placeholder="搜索姓名/昵称/学校/职业"
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
        
        <el-form-item label="关系">
          <el-select v-model="searchForm.relationship" placeholder="选择关系" clearable>
            <el-option label="家人" value="family" />
            <el-option label="朋友" value="friend" />
            <el-option label="同事" value="colleague" />
            <el-option label="同学" value="classmate" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="性别">
          <el-select v-model="searchForm.sex" placeholder="选择性别" clearable>
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="重要程度">
          <el-select v-model="searchForm.importance" placeholder="选择重要程度" clearable>
            <el-option label="5星" :value="5" />
            <el-option label="4星" :value="4" />
            <el-option label="3星" :value="3" />
            <el-option label="2星" :value="2" />
            <el-option label="1星" :value="1" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加好友
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 好友列表表格 -->
    <div class="content-card">
      <el-table :data="friendList" v-loading="loading" stripe>
        <el-table-column prop="name" label="姓名" width="120" fixed>
          <template #default="{ row }">
            <div class="name-cell">
              <el-avatar :size="32" :src="row.avatar" style="margin-right: 8px">
                {{ row.name.charAt(0) }}
              </el-avatar>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="nickname" label="昵称" width="100" />
        
        <el-table-column prop="sex" label="性别" width="60">
          <template #default="{ row }">
            {{ row.sex === 1 ? '男' : '女' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="relationship" label="关系" width="100">
          <template #default="{ row }">
            <el-tag :type="getRelationshipType(row.relationship)" size="small">
              {{ getRelationshipText(row.relationship) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="importance" label="重要程度" width="140">
          <template #default="{ row }">
            <el-rate v-model="row.importance" disabled size="small" />
          </template>
        </el-table-column>
        
        <el-table-column prop="profession" label="职业" width="120" show-overflow-tooltip />
        
        <el-table-column prop="school" label="学校" width="120" show-overflow-tooltip />
        
        <el-table-column prop="birthDate" label="生日" width="120">
          <template #default="{ row }">
            {{ row.birthDate ? formatBirthDate(row.birthDate) : '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="lastContactDate" label="最后联系" width="120">
          <template #default="{ row }">
            {{ row.lastContactDate ? formatDate(row.lastContactDate) : '-' }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleView(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button type="primary" size="small" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="success" size="small" link @click="handleUpdateContact(row)">
              <el-icon><Phone /></el-icon>
              联系
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="!loading && friendList.length === 0" description="暂无好友数据" />
      
      <!-- 分页 -->
      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadFriends"
          @current-change="loadFriends"
        />
      </div>
    </div>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="好友详情"
      width="700px"
    >
      <div v-if="currentFriend" class="friend-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ currentFriend.name }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ currentFriend.nickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentFriend.sex === 1 ? '男' : '女' }}</el-descriptions-item>
          <el-descriptions-item label="生日">
            {{ currentFriend.birthDate ? formatBirthDate(currentFriend.birthDate) : '-' }}
            ({{ currentFriend.birthType === 1 ? '农历' : '公历' }})
          </el-descriptions-item>
          <el-descriptions-item label="关系">
            <el-tag :type="getRelationshipType(currentFriend.relationship)" size="small">
              {{ getRelationshipText(currentFriend.relationship) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="重要程度">
            <el-rate v-model="currentFriend.importance" disabled size="small" />
          </el-descriptions-item>
          <el-descriptions-item label="学校" :span="2">{{ currentFriend.school || '-' }}</el-descriptions-item>
          <el-descriptions-item label="职业" :span="2">{{ currentFriend.profession || '-' }}</el-descriptions-item>
          <el-descriptions-item label="居住地址" :span="2">{{ currentFriend.liveAddress || '-' }}</el-descriptions-item>
          <el-descriptions-item label="家庭地址" :span="2">{{ currentFriend.homeAddress || '-' }}</el-descriptions-item>
          <el-descriptions-item label="性格" :span="2">{{ currentFriend.disposition || '-' }}</el-descriptions-item>
          <el-descriptions-item label="爱好" :span="2">
            <el-tag v-for="hobby in parseJson(currentFriend.hobbies)" :key="hobby" size="small" style="margin-right: 8px">
              {{ hobby }}
            </el-tag>
            <span v-if="!parseJson(currentFriend.hobbies).length">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="标签" :span="2">
            <el-tag v-for="tag in parseJson(currentFriend.tags)" :key="tag" size="small" type="success" style="margin-right: 8px">
              {{ tag }}
            </el-tag>
            <span v-if="!parseJson(currentFriend.tags).length">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="优点" :span="2">
            <div v-for="adv in parseJson(currentFriend.advantages)" :key="adv">• {{ adv }}</div>
            <span v-if="!parseJson(currentFriend.advantages).length">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="缺点" :span="2">
            <div v-for="dis in parseJson(currentFriend.disadvantages)" :key="dis">• {{ dis }}</div>
            <span v-if="!parseJson(currentFriend.disadvantages).length">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentFriend.remark || '-' }}</el-descriptions-item>
          <el-descriptions-item label="最后联系时间" :span="2">
            {{ currentFriend.lastContactDate ? formatDate(currentFriend.lastContactDate) : '-' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="contact-info" v-if="parseJson(currentFriend.contacts).length > 0">
          <h4>联系方式</h4>
          <el-table :data="parseJson(currentFriend.contacts)" size="small">
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                {{ getContactTypeText(row.type) }}
              </template>
            </el-table-column>
            <el-table-column prop="value" label="值" />
            <el-table-column prop="label" label="标签" width="100" />
            <el-table-column prop="isPrimary" label="主要" width="80">
              <template #default="{ row }">
                <el-tag v-if="row.isPrimary" type="success" size="small">是</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-tabs v-model="activeTab">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="formData.name" placeholder="请输入姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="昵称">
                  <el-input v-model="formData.nickname" placeholder="请输入昵称" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="性别">
                  <el-radio-group v-model="formData.sex">
                    <el-radio :label="1">男</el-radio>
                    <el-radio :label="2">女</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="生日类型">
                  <el-radio-group v-model="formData.birthType">
                    <el-radio :label="2">公历</el-radio>
                    <el-radio :label="1">农历</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="生日">
                  <el-date-picker
                    v-model="formData.birthDate"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="关系">
                  <el-select v-model="formData.relationship" placeholder="选择关系">
                    <el-option label="家人" value="family" />
                    <el-option label="朋友" value="friend" />
                    <el-option label="同事" value="colleague" />
                    <el-option label="同学" value="classmate" />
                    <el-option label="其他" value="other" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="重要程度">
              <el-rate v-model="formData.importance" />
            </el-form-item>
          </el-tab-pane>
          
          <!-- 联系方式 -->
          <el-tab-pane label="联系方式" name="contact">
            <el-form-item label="电话">
              <el-input v-model="formData.phone" placeholder="请输入电话号码" />
            </el-form-item>
            <el-form-item label="QQ">
              <el-input v-model="formData.qq" placeholder="请输入QQ号" />
            </el-form-item>
            <el-form-item label="微信">
              <el-input v-model="formData.wechat" placeholder="请输入微信号" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="formData.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-tab-pane>
          
          <!-- 详细信息 -->
          <el-tab-pane label="详细信息" name="detail">
            <el-form-item label="学校">
              <el-input v-model="formData.school" placeholder="请输入学校" />
            </el-form-item>
            <el-form-item label="职业">
              <el-input v-model="formData.profession" placeholder="请输入职业" />
            </el-form-item>
            <el-form-item label="居住地址">
              <el-input v-model="formData.liveAddress" placeholder="请输入居住地址" />
            </el-form-item>
            <el-form-item label="家庭地址">
              <el-input v-model="formData.homeAddress" placeholder="请输入家庭地址" />
            </el-form-item>
            <el-form-item label="性格">
              <el-input v-model="formData.disposition" type="textarea" :rows="2" placeholder="请输入性格特点" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
            </el-form-item>
          </el-tab-pane>
          
          <!-- 个性标签 -->
          <el-tab-pane label="个性标签" name="tags">
            <el-form-item label="爱好">
              <el-tag
                v-for="hobby in formData.hobbies"
                :key="hobby"
                closable
                @close="removeItem(formData.hobbies, hobby)"
                style="margin-right: 8px; margin-bottom: 8px"
              >
                {{ hobby }}
              </el-tag>
              <el-input
                v-if="hobbyInputVisible"
                ref="hobbyInputRef"
                v-model="hobbyInputValue"
                size="small"
                @keyup.enter="handleHobbyInputConfirm"
                @blur="handleHobbyInputConfirm"
                style="width: 100px"
              />
              <el-button v-else size="small" @click="showHobbyInput">+ 添加爱好</el-button>
            </el-form-item>
            
            <el-form-item label="标签">
              <el-tag
                v-for="tag in formData.tags"
                :key="tag"
                closable
                @close="removeItem(formData.tags, tag)"
                type="success"
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
            
            <el-form-item label="优点">
              <div v-for="(adv, index) in formData.advantages" :key="index" style="margin-bottom: 8px">
                <el-input v-model="formData.advantages[index]" placeholder="请输入优点">
                  <template #append>
                    <el-button @click="removeArrayItem(formData.advantages, index)">删除</el-button>
                  </template>
                </el-input>
              </div>
              <el-button size="small" @click="addArrayItem(formData.advantages)">+ 添加优点</el-button>
            </el-form-item>
            
            <el-form-item label="缺点">
              <div v-for="(dis, index) in formData.disadvantages" :key="index" style="margin-bottom: 8px">
                <el-input v-model="formData.disadvantages[index]" placeholder="请输入缺点">
                  <template #append>
                    <el-button @click="removeArrayItem(formData.disadvantages, index)">删除</el-button>
                  </template>
                </el-input>
              </div>
              <el-button size="small" @click="addArrayItem(formData.disadvantages)">+ 添加缺点</el-button>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
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
import { Search, Plus, View, Edit, Delete, Phone } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import {
  getFriendList,
  createFriend,
  updateFriend,
  deleteFriend,
  updateLastContact
} from '@/api/friends'

const loading = ref(false)
const friendList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索表单
const searchForm = ref({
  search: '',
  relationship: '',
  sex: null,
  importance: null
})

// 对话框相关
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const dialogTitle = computed(() => isEdit.value ? '编辑好友' : '添加好友')
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const currentFriend = ref(null)
const activeTab = ref('basic')

// 标签输入
const hobbyInputVisible = ref(false)
const hobbyInputValue = ref('')
const hobbyInputRef = ref(null)
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref(null)

// 表单数据
const formData = ref({
  name: '',
  nickname: '',
  sex: 1,
  birthDate: null,
  birthType: 2,
  relationship: 'friend',
  importance: 3,
  phone: '',
  qq: '',
  wechat: '',
  email: '',
  school: '',
  profession: '',
  liveAddress: '',
  homeAddress: '',
  disposition: '',
  remark: '',
  hobbies: [],
  tags: [],
  advantages: [],
  disadvantages: []
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 1, max: 50, message: '姓名长度在 1 到 50 个字符', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const formatBirthDate = (date) => {
  return dayjs(date).format('MM-DD')
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

// 获取关系类型
const getRelationshipType = (relationship) => {
  const types = {
    family: 'danger',
    friend: 'success',
    colleague: 'warning',
    classmate: 'primary',
    other: 'info'
  }
  return types[relationship] || 'info'
}

// 获取关系文本
const getRelationshipText = (relationship) => {
  const texts = {
    family: '家人',
    friend: '朋友',
    colleague: '同事',
    classmate: '同学',
    other: '其他'
  }
  return texts[relationship] || relationship
}

// 获取联系方式类型文本
const getContactTypeText = (type) => {
  const texts = {
    phone: '电话',
    qq: 'QQ',
    wechat: '微信',
    email: '邮箱'
  }
  return texts[type] || type
}

// 加载好友列表
const loadFriends = async () => {
  try {
    loading.value = true
    const res = await getFriendList({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value
    })
    
    if (res.success) {
      friendList.value = res.data.list
      total.value = res.data.pagination.total
    } else {
      ElMessage.error(res.message || '获取好友列表失败')
    }
  } catch (error) {
    console.error('获取好友列表失败:', error)
    ElMessage.error('获取好友列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadFriends()
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    search: '',
    relationship: '',
    sex: null,
    importance: null
  }
  handleSearch()
}

// 新增好友
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
  activeTab.value = 'basic'
}

// 查看详情
const handleView = (row) => {
  currentFriend.value = row
  viewDialogVisible.value = true
}

// 编辑好友
const handleEdit = (row) => {
  isEdit.value = true
  currentFriend.value = row
  
  // 填充表单数据
  formData.value = {
    name: row.name,
    nickname: row.nickname || '',
    sex: row.sex,
    birthDate: row.birthDate ? new Date(row.birthDate) : null,
    birthType: row.birthType,
    relationship: row.relationship,
    importance: row.importance,
    phone: '',
    qq: '',
    wechat: '',
    email: '',
    school: row.school || '',
    profession: row.profession || '',
    liveAddress: row.liveAddress || '',
    homeAddress: row.homeAddress || '',
    disposition: row.disposition || '',
    remark: row.remark || '',
    hobbies: parseJson(row.hobbies),
    tags: parseJson(row.tags),
    advantages: parseJson(row.advantages),
    disadvantages: parseJson(row.disadvantages)
  }
  
  // 解析联系方式
  const contacts = parseJson(row.contacts)
  contacts.forEach(contact => {
    if (contact.type === 'phone') formData.value.phone = contact.value
    if (contact.type === 'qq') formData.value.qq = contact.value
    if (contact.type === 'wechat') formData.value.wechat = contact.value
    if (contact.type === 'email') formData.value.email = contact.value
  })
  
  dialogVisible.value = true
  activeTab.value = 'basic'
}

// 删除好友
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除好友 "${row.name}" 吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    const res = await deleteFriend(row.id)
    if (res.success) {
      ElMessage.success('删除成功')
      loadFriends()
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

// 更新联系时间
const handleUpdateContact = async (row) => {
  try {
    const res = await updateLastContact(row.id)
    if (res.success) {
      ElMessage.success('已更新联系时间')
      loadFriends()
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (error) {
    console.error('更新联系时间失败:', error)
    ElMessage.error('更新失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      submitLoading.value = true
      
      // 构建联系方式数组
      const contacts = []
      if (formData.value.phone) contacts.push({ type: 'phone', value: formData.value.phone, isPrimary: true })
      if (formData.value.qq) contacts.push({ type: 'qq', value: formData.value.qq })
      if (formData.value.wechat) contacts.push({ type: 'wechat', value: formData.value.wechat })
      if (formData.value.email) contacts.push({ type: 'email', value: formData.value.email })
      
      const submitData = {
        name: formData.value.name,
        nickname: formData.value.nickname || undefined,
        sex: formData.value.sex,
        birthDate: formData.value.birthDate || undefined,
        birthType: formData.value.birthType,
        relationship: formData.value.relationship,
        importance: formData.value.importance,
        contacts: contacts.length > 0 ? contacts : undefined,
        school: formData.value.school || undefined,
        profession: formData.value.profession || undefined,
        liveAddress: formData.value.liveAddress || undefined,
        homeAddress: formData.value.homeAddress || undefined,
        disposition: formData.value.disposition || undefined,
        remark: formData.value.remark || undefined,
        hobbies: formData.value.hobbies.length > 0 ? formData.value.hobbies : undefined,
        tags: formData.value.tags.length > 0 ? formData.value.tags : undefined,
        advantages: formData.value.advantages.filter(a => a).length > 0 ? formData.value.advantages.filter(a => a) : undefined,
        disadvantages: formData.value.disadvantages.filter(d => d).length > 0 ? formData.value.disadvantages.filter(d => d) : undefined
      }
      
      let res
      if (isEdit.value) {
        res = await updateFriend(currentFriend.value.id, submitData)
      } else {
        res = await createFriend(submitData)
      }
      
      if (res.success) {
        ElMessage.success(isEdit.value ? '更新好友成功' : '创建好友成功')
        handleCancel()
        loadFriends()
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
  currentFriend.value = null
  resetForm()
}

// 重置表单
const resetForm = () => {
  formData.value = {
    name: '',
    nickname: '',
    sex: 1,
    birthDate: null,
    birthType: 2,
    relationship: 'friend',
    importance: 3,
    phone: '',
    qq: '',
    wechat: '',
    email: '',
    school: '',
    profession: '',
    liveAddress: '',
    homeAddress: '',
    disposition: '',
    remark: '',
    hobbies: [],
    tags: [],
    advantages: [],
    disadvantages: []
  }
  formRef.value?.resetFields()
}

// 标签处理
const removeItem = (arr, item) => {
  const index = arr.indexOf(item)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

const showHobbyInput = () => {
  hobbyInputVisible.value = true
  nextTick(() => {
    hobbyInputRef.value?.input?.focus()
  })
}

const handleHobbyInputConfirm = () => {
  if (hobbyInputValue.value && !formData.value.hobbies.includes(hobbyInputValue.value)) {
    formData.value.hobbies.push(hobbyInputValue.value)
  }
  hobbyInputVisible.value = false
  hobbyInputValue.value = ''
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

const addArrayItem = (arr) => {
  arr.push('')
}

const removeArrayItem = (arr, index) => {
  arr.splice(index, 1)
}

// 初始化
onMounted(() => {
  loadFriends()
})
</script>

<style lang="scss" scoped>
.friends {
  .search-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }
  
  .name-cell {
    display: flex;
    align-items: center;
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  .friend-detail {
    .contact-info {
      margin-top: 20px;
      
      h4 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 16px;
      }
    }
  }
}

.mb-20 {
  margin-bottom: 20px;
}
</style>

