<template>
  <div class="users">
    <div class="content-card">
      <div class="card-header">
        <h3>用户管理</h3>
      </div>
      
      <el-table :data="userList" v-loading="loading">
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="createdAt" label="注册时间" :formatter="formatDate" width="180" />
        <el-table-column prop="updatedAt" label="更新时间" :formatter="formatDate" width="180" />
        <el-table-column prop="lastSyncAt" label="最后同步" :formatter="formatDate" width="180" />
      </el-table>
      
      <el-empty v-if="!loading && userList.length === 0" description="暂无用户数据" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getUserList } from '@/api/users'

const loading = ref(false)
const userList = ref([])

const formatDate = (row, column, cellValue) => {
  return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm') : '-'
}

// 加载用户列表
const loadUsers = async () => {
  try {
    loading.value = true
    const res = await getUserList()
    if (res.code === 0) {
      userList.value = res.data
    } else {
      ElMessage.error(res.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style lang="scss" scoped>
.users {
  .card-header {
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
    }
  }
}
</style>
