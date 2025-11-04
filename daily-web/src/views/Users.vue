<template>
  <div class="users">
    <div class="content-card">
      <div class="card-header">
        <h3>用户管理</h3>
      </div>
      
      <el-table :data="userList" v-loading="loading">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="createdAt" label="注册时间" :formatter="formatDate" />
        <el-table-column prop="lastSyncAt" label="最后同步" :formatter="formatDate" />
        <el-table-column prop="isActive" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="!loading && userList.length === 0" description="暂无用户数据" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'

const loading = ref(false)
const userList = ref([])

const formatDate = (row, column, cellValue) => {
  return cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm') : '-'
}

onMounted(() => {
  // 模拟数据
  userList.value = [
    {
      id: '1',
      username: '管理员',
      email: 'admin@example.com',
      createdAt: new Date(),
      lastSyncAt: new Date(),
      isActive: true
    }
  ]
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
