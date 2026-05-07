<template>
  <div
    class="flex justify-between fixed top-0 left-0 right-0 z-10 h-16 bg-white text-slate-700 dark:text-slate-300 dark:bg-slate-900 shadow dark:shadow-gray-700 items-center px-2"
  >
    <div class="flex items-center cursor-pointer flex-1">
      <div
        class="flex items-center justify-center cursor-pointer"
        :class="isMobile ? '' : 'min-w-48'"
        @click="router.push({ path: '/' })"
      >
        <Logo />
        <div
          v-if="!isMobile"
          class="inline-flex font-bold text-2xl ml-2"
          :class="
            (config.side_mode === 'head' ||
              config.side_mode === 'combination') &&
            'min-w-fit'
          "
        >
          {{ $GIN_VUE_ADMIN.appName }}
        </div>
      </div>

      <el-breadcrumb
        v-show="!isMobile"
        v-if="config.side_mode !== 'head' && config.side_mode !== 'combination'"
        class="ml-4"
      >
        <el-breadcrumb-item
          v-for="item in matched.slice(1, matched.length)"
          :key="item.path"
        >
          {{ fmtTitle(item.meta.title, route) }}
        </el-breadcrumb-item>
      </el-breadcrumb>
      <gva-aside
        v-if="config.side_mode === 'head' && !isMobile"
        class="flex-1"
      />
      <gva-aside
        v-if="config.side_mode === 'combination' && !isMobile"
        mode="head"
        class="flex-1"
      />
    </div>

    <div class="ml-2 flex items-center">
      <tools />
      <el-dropdown>
        <div class="flex justify-center items-center h-full w-full">
          <span
            class="cursor-pointer flex justify-center items-center text-black dark:text-gray-100"
          >
            <el-icon class="mr-1">
              <User />
            </el-icon>
            <span v-show="!isMobile">管理员</span>
            <el-icon>
              <arrow-down />
            </el-icon>
          </span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item icon="reading-lamp" @click="userStore.LoginOut">
              登 出
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
  import tools from './tools.vue'
  import { useUserStore } from '@/pinia/modules/user'
  import { useRoute, useRouter } from 'vue-router'
  import { useAppStore } from '@/pinia'
  import { storeToRefs } from 'pinia'
  import { computed } from 'vue'
  import { fmtTitle } from '@/utils/fmtRouterTitle'
  import gvaAside from '@/view/layout/aside/index.vue'
  import Logo from '@/components/logo/index.vue'
  import { User } from '@element-plus/icons-vue'

  const userStore = useUserStore()
  const router = useRouter()
  const route = useRoute()
  const appStore = useAppStore()
  const { device, config } = storeToRefs(appStore)
  const isMobile = computed(() => {
    return device.value === 'mobile'
  })
  const matched = computed(() => route.meta.matched)
</script>

<style scoped lang="scss"></style>
