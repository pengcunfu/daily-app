<template>
  <div class="dashboard">
    <el-row :gutter="20" class="mb-20">
      <!-- 统计卡片 -->
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.key">
        <div class="stat-card" :style="{ background: stat.color }">
          <div class="stat-number">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <el-icon class="stat-icon">
            <component :is="stat.icon" />
          </el-icon>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 最近形象记录 -->
      <el-col :xs="24" :lg="16">
        <div class="content-card">
          <div class="card-header">
            <h3>最近形象记录</h3>
            <el-button type="primary" size="small" @click="$router.push('/appearances')">
              查看全部
            </el-button>
          </div>
          
          <div v-loading="recentLoading" class="recent-appearances">
            <div
              v-for="item in recentAppearances"
              :key="item.id"
              class="appearance-item"
            >
              <div class="appearance-photos">
                <el-image
                  v-for="(photo, index) in item.photos.slice(0, 3)"
                  :key="index"
                  :src="photo"
                  fit="cover"
                  class="photo-thumb"
                  :preview-src-list="item.photos"
                />
                <div v-if="item.photos.length > 3" class="more-photos">
                  +{{ item.photos.length - 3 }}
                </div>
              </div>
              
              <div class="appearance-info">
                <h4>{{ item.title }}</h4>
                <p class="description">{{ item.description }}</p>
                <div class="meta-info">
                  <el-tag v-if="item.mood" size="small" type="success">{{ item.mood }}</el-tag>
                  <el-tag v-if="item.weather" size="small" type="info">{{ item.weather }}</el-tag>
                  <el-tag v-if="item.occasion" size="small" type="warning">{{ item.occasion }}</el-tag>
                  <span class="date">{{ formatDate(item.createdAt) }}</span>
                </div>
              </div>
              
              <div class="appearance-rating" v-if="item.rating">
                <el-rate v-model="item.rating" disabled show-score />
              </div>
            </div>
            
            <el-empty v-if="!recentLoading && recentAppearances.length === 0" description="暂无形象记录" />
          </div>
        </div>
      </el-col>

      <!-- 统计图表 -->
      <el-col :xs="24" :lg="8">
        <div class="content-card">
          <div class="card-header">
            <h3>心情统计</h3>
          </div>
          
          <div v-loading="chartLoading" style="height: 300px;">
            <v-chart
              v-if="!chartLoading && moodChartData.length > 0"
              :option="moodChartOption"
              style="height: 100%;"
            />
            <el-empty v-else-if="!chartLoading" description="暂无数据" />
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <!-- 快速操作 -->
      <el-col :xs="24" :md="12">
        <div class="content-card">
          <div class="card-header">
            <h3>快速操作</h3>
          </div>
          
          <div class="quick-actions">
            <el-button
              type="primary"
              size="large"
              @click="$router.push('/appearances?action=create')"
              class="action-btn"
            >
              <el-icon><Plus /></el-icon>
              添加形象记录
            </el-button>
            
            <el-button
              type="success"
              size="large"
              @click="$router.push('/appearances')"
              class="action-btn"
            >
              <el-icon><View /></el-icon>
              浏览形象记录
            </el-button>
            
            <el-button
              type="info"
              size="large"
              @click="$router.push('/users')"
              class="action-btn"
            >
              <el-icon><User /></el-icon>
              用户管理
            </el-button>
          </div>
        </div>
      </el-col>

      <!-- 系统信息 -->
      <el-col :xs="24" :md="12">
        <div class="content-card">
          <div class="card-header">
            <h3>系统信息</h3>
          </div>
          
          <div class="system-info">
            <div class="info-item">
              <span class="label">系统版本：</span>
              <span class="value">v1.0.0</span>
            </div>
            <div class="info-item">
              <span class="label">最后登录：</span>
              <span class="value">{{ formatDate(new Date()) }}</span>
            </div>
            <div class="info-item">
              <span class="label">在线用户：</span>
              <span class="value">{{ onlineUsers }}</span>
            </div>
            <div class="info-item">
              <span class="label">服务状态：</span>
              <el-tag type="success" size="small">正常运行</el-tag>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { getAppearances, getAppearanceStats } from '@/api/appearance'
import dayjs from 'dayjs'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

// 响应式数据
const recentAppearances = ref([])
const recentLoading = ref(false)
const chartLoading = ref(false)
const onlineUsers = ref(1)

// 统计数据
const stats = ref([
  {
    key: 'total',
    label: '总记录数',
    value: '0',
    icon: 'Camera',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    key: 'month',
    label: '本月记录',
    value: '0',
    icon: 'Calendar',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    key: 'rating',
    label: '平均评分',
    value: '0',
    icon: 'Star',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    key: 'users',
    label: '活跃用户',
    value: '0',
    icon: 'User',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
])

// 心情图表数据
const moodChartData = ref([])
const moodChartOption = computed(() => ({
  title: {
    text: '心情分布',
    left: 'center',
    textStyle: {
      fontSize: 14
    }
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    bottom: 'bottom'
  },
  series: [
    {
      name: '心情统计',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      data: moodChartData.value,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}))

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取最近形象记录
const fetchRecentAppearances = async () => {
  recentLoading.value = true
  try {
    const response = await getAppearances({
      page: 1,
      pageSize: 5
    })
    recentAppearances.value = response.data.list.map(item => ({
      ...item,
      photos: JSON.parse(item.photos || '[]')
    }))
  } catch (error) {
    console.error('获取最近形象记录失败:', error)
  } finally {
    recentLoading.value = false
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await getAppearanceStats()
    const data = response.data
    
    // 更新统计卡片
    stats.value[0].value = data.totalCount.toString()
    stats.value[1].value = data.thisMonthCount.toString()
    stats.value[2].value = data.avgRating ? data.avgRating.toString() : '0'
    stats.value[3].value = onlineUsers.value.toString()
    
    // 更新心情图表数据
    if (data.moodStats && data.moodStats.length > 0) {
      moodChartData.value = data.moodStats.map(item => ({
        name: item.mood,
        value: item.count
      }))
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 初始化数据
onMounted(async () => {
  chartLoading.value = true
  await Promise.all([
    fetchRecentAppearances(),
    fetchStats()
  ])
  chartLoading.value = false
})
</script>

<style lang="scss" scoped>
.dashboard {
  .stat-card {
    position: relative;
    padding: 20px;
    border-radius: 8px;
    color: white;
    margin-bottom: 20px;
    overflow: hidden;
    
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .stat-label {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .stat-icon {
      position: absolute;
      right: 20px;
      top: 20px;
      font-size: 32px;
      opacity: 0.3;
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      color: #333;
      font-size: 16px;
    }
  }
  
  .recent-appearances {
    .appearance-item {
      display: flex;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .appearance-photos {
        display: flex;
        margin-right: 15px;
        position: relative;
        
        .photo-thumb {
          width: 60px;
          height: 60px;
          border-radius: 6px;
          margin-right: 8px;
          
          &:last-child {
            margin-right: 0;
          }
        }
        
        .more-photos {
          position: absolute;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }
      }
      
      .appearance-info {
        flex: 1;
        
        h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #333;
        }
        
        .description {
          margin: 0 0 8px 0;
          color: #666;
          font-size: 12px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .meta-info {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .date {
            color: #999;
            font-size: 12px;
            margin-left: auto;
          }
        }
      }
      
      .appearance-rating {
        margin-left: 15px;
      }
    }
  }
  
  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .action-btn {
      width: 100%;
      height: 48px;
      font-size: 14px;
    }
  }
  
  .system-info {
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .label {
        color: #666;
        font-size: 14px;
      }
      
      .value {
        color: #333;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard {
    .recent-appearances {
      .appearance-item {
        flex-direction: column;
        align-items: flex-start;
        
        .appearance-photos {
          margin-bottom: 10px;
        }
        
        .appearance-rating {
          margin-left: 0;
          margin-top: 10px;
        }
      }
    }
    
    .quick-actions {
      .action-btn {
        height: 44px;
      }
    }
  }
}
</style>
