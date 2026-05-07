<template>
  <div
    class="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    :class="[{ 'animate-pulse': loading }]"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">{{ title }}</p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white">
          <span v-if="!loading">{{ formattedValue }}</span>
          <span v-else class="text-slate-300 dark:text-slate-600">--</span>
        </p>
      </div>
      <div
        class="flex h-10 w-10 items-center justify-center rounded-lg"
        :class="iconBgClass"
      >
        <el-icon :size="20" :class="iconTextClass">
          <component :is="iconComponent" />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import {
    User,
    UserFilled,
    Plus,
    TrendCharts,
    Calendar,
    Coin
  } from '@element-plus/icons-vue'

  const props = defineProps({
    title: {
      type: String,
      default: ''
    },
    value: {
      type: [Number, String],
      default: 0
    },
    icon: {
      type: String,
      default: 'User'
    },
    color: {
      type: String,
      default: 'blue'
    },
    loading: {
      type: Boolean,
      default: false
    }
  })

  const iconComponent = computed(() => {
    const iconMap = {
      User,
      UserFilled,
      Plus,
      TrendCharts,
      Calendar,
      Coin
    }
    return iconMap[props.icon] || User
  })

  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400'
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400'
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400'
    },
    cyan: {
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
      text: 'text-cyan-600 dark:text-cyan-400'
    },
    yellow: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-600 dark:text-yellow-400'
    }
  }

  const iconBgClass = computed(() => colorClasses[props.color]?.bg || colorClasses.blue.bg)
  const iconTextClass = computed(() => colorClasses[props.color]?.text || colorClasses.blue.text)

  const formattedValue = computed(() => {
    const num = Number(props.value)
    if (isNaN(num)) return props.value
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  })
</script>

<style scoped lang="scss"></style>
