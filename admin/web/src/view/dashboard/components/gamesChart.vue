<template>
  <div class="h-full w-full">
    <div v-if="loading" class="h-full flex items-center justify-center">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
    </div>
    <Chart v-else :height="height" :option="chartOption" />
  </div>
</template>

<script setup>
  import Chart from '@/components/charts/index.vue'
  import useChartOption from '@/hooks/charts'
  import { graphic } from 'echarts'
  import { computed } from 'vue'
  import { useAppStore } from '@/pinia'
  import { storeToRefs } from 'pinia'
  import { Loading } from '@element-plus/icons-vue'

  const appStore = useAppStore()
  const { config } = storeToRefs(appStore)

  const props = defineProps({
    height: {
      type: String,
      default: '300px'
    },
    data: {
      type: Object,
      default: () => ({
        labels: [],
        data: []
      })
    },
    loading: {
      type: Boolean,
      default: false
    }
  })

  const axisTextColor = computed(() => {
    return appStore.isDark ? 'rgba(255,255,255,0.70)' : 'rgba(0,0,0,0.70)'
  })

  const dotColor = computed(() => {
    return appStore.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'
  })

  const { chartOption } = useChartOption(() => ({
    grid: {
      left: '50',
      right: '20',
      top: '20',
      bottom: '40'
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: appStore.isDark ? '#1e293b' : '#ffffff',
      borderColor: appStore.isDark ? '#334155' : '#e2e8f0',
      textStyle: {
        color: axisTextColor.value
      },
      formatter(params) {
        const [firstElement] = params
        return `
          <div style="padding: 8px;">
            <p style="font-weight: 500; margin-bottom: 8px;">${firstElement.axisValueLabel}</p>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #8b5cf6;"></span>
              <span>游戏场次</span>
              <span style="font-weight: 600; margin-left: auto;">${Number(firstElement.value).toLocaleString()}</span>
            </div>
          </div>
        `
      }
    },
    xAxis: {
      type: 'category',
      data: props.data.labels || [],
      boundaryGap: true,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: axisTextColor.value,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: axisTextColor.value,
        formatter(value) {
          if (value >= 1000) {
            return (value / 1000).toFixed(0) + 'k'
          }
          return value
        }
      },
      splitLine: {
        lineStyle: {
          color: dotColor.value,
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '游戏场次',
        type: 'bar',
        barWidth: '40%',
        data: props.data.data || [],
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#8b5cf6' },
            { offset: 1, color: '#a78bfa' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#7c3aed' },
              { offset: 1, color: '#8b5cf6' }
            ])
          }
        }
      }
    ]
  }))
</script>

<style scoped lang="scss"></style>
