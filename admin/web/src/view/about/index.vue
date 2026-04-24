<template>
  <div class="mt-2">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="w-full md:w-1/2">
        <el-card class="min-w-96">
          <template #header>
            <el-divider>柴米油盐后台管理系统</el-divider>
          </template>
          <div>
            <div class="w-full flex items-center justify-center">
              <img
                class="org-img dom-center"
                src="@/assets/logo.png"
                alt="柴米油盐"
              />
            </div>
            <div class="w-full flex items-center justify-center mt-4">
              <p class="text-lg text-gray-600">斗地主游戏后台管理系统</p>
            </div>
          </div>
        </el-card>
        <el-card class="min-w-96 mt-5">
          <template #header>
            <div>系统信息</div>
          </template>
          <div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-4 bg-gray-50 rounded">
                <p class="text-sm text-gray-500">系统名称</p>
                <p class="text-lg font-medium">柴米油盐后台管理系统</p>
              </div>
              <div class="p-4 bg-gray-50 rounded">
                <p class="text-sm text-gray-500">系统版本</p>
                <p class="text-lg font-medium">v2.9.1</p>
              </div>
              <div class="p-4 bg-gray-50 rounded">
                <p class="text-sm text-gray-500">技术栈</p>
                <p class="text-lg font-medium">Golang + Vue3</p>
              </div>
              <div class="p-4 bg-gray-50 rounded">
                <p class="text-sm text-gray-500">框架</p>
                <p class="text-lg font-medium">gin-vue-admin (开源框架)</p>
              </div>
            </div>
          </div>
        </el-card>
      </div>
      <div class="w-full md:w-1/2">
        <el-card>
          <template #header>
            <div>功能介绍</div>
          </template>
          <div class="h-[calc(100vh-300px)] overflow-y-auto">
            <div class="space-y-4">
              <div class="p-4 bg-blue-50 rounded">
                <h4 class="font-medium text-blue-800">玩家管理</h4>
                <p class="text-sm text-gray-600 mt-1">管理游戏玩家账户信息、玩家统计等</p>
              </div>
              <div class="p-4 bg-green-50 rounded">
                <h4 class="font-medium text-green-800">游戏管理</h4>
                <p class="text-sm text-gray-600 mt-1">游戏房间配置、游戏记录、日志管理等</p>
              </div>
              <div class="p-4 bg-purple-50 rounded">
                <h4 class="font-medium text-purple-800">系统管理</h4>
                <p class="text-sm text-gray-600 mt-1">用户权限、菜单管理、API管理等</p>
              </div>
              <div class="p-4 bg-orange-50 rounded">
                <h4 class="font-medium text-orange-800">数据统计</h4>
                <p class="text-sm text-gray-600 mt-1">玩家排行榜、游戏数据统计等</p>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
  defineOptions({
    name: 'About'
  })
</script>

<style scoped>
  .org-img {
    height: 150px;
    width: 150px;
  }

  .dom-center {
    margin-left: 50%;
    transform: translateX(-50%);
  }
</style>
