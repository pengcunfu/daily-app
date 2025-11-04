<template>
  <div class="settings">
    <div class="content-card">
      <div class="card-header">
        <h3>系统设置</h3>
      </div>
      
      <el-form :model="settingsForm" label-width="120px">
        <el-form-item label="系统名称">
          <el-input v-model="settingsForm.systemName" />
        </el-form-item>
        
        <el-form-item label="系统描述">
          <el-input v-model="settingsForm.systemDesc" type="textarea" :rows="3" />
        </el-form-item>
        
        <el-form-item label="文件上传限制">
          <el-input v-model="settingsForm.uploadLimit" suffix="MB" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存设置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const settingsForm = reactive({
  systemName: 'DailyApp 管理后台',
  systemDesc: '形象管理系统',
  uploadLimit: '10'
})

const handleSave = () => {
  ElMessage.success('设置保存成功')
}
</script>

<style lang="scss" scoped>
.settings {
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
