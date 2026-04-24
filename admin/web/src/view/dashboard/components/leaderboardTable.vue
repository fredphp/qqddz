<template>
  <div>
    <el-table :data="data" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="rank" label="排名" width="80" align="center">
        <template #default="{ row }">
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            :class="getRankClass(row.rank)"
          >
            {{ row.rank }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="玩家昵称" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <el-avatar :size="32" :src="row.avatar" class="flex-shrink-0">
              {{ row.nickname?.charAt(0) || '匿' }}
            </el-avatar>
            <div>
              <p class="font-medium text-slate-900 dark:text-white">{{ row.nickname || '匿名玩家' }}</p>
              <p class="text-xs text-slate-500">ID: {{ row.playerId }}</p>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="level" label="等级" width="80" align="center">
        <template #default="{ row }">
          <el-tag size="small" type="success">Lv.{{ row.level || 1 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="score" label="金币" width="120" align="right">
        <template #default="{ row }">
          <span class="font-mono font-medium text-yellow-600 dark:text-yellow-400">
            {{ formatNumber(row.score) }}
          </span>
        </template>
      </el-table-column>
    </el-table>
    
    <div v-if="!loading && data.length === 0" class="py-8 text-center text-slate-500">
      暂无排行数据
    </div>
  </div>
</template>

<script setup>
  defineProps({
    data: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  })

  const getRankClass = (rank) => {
    if (rank === 1) return 'bg-yellow-500 text-white'
    if (rank === 2) return 'bg-slate-400 text-white'
    if (rank === 3) return 'bg-amber-600 text-white'
    return 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
  }

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0'
    const n = Number(num)
    if (n >= 1000000) {
      return (n / 1000000).toFixed(1) + 'M'
    }
    if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'K'
    }
    return n.toLocaleString()
  }
</script>

<style scoped lang="scss"></style>
