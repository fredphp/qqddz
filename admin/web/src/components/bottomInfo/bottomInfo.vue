<template>
  <div
    class="flex flex-col md:flex-row gap-2 items-center text-sm text-slate-700 dark:text-slate-500 justify-center py-2"
  >
    <div class="text-center">
      <span class="mr-1">Copyright</span>
      <span>
        <span class="font-bold text-active">柴米油盐</span>
      </span>
    </div>
    <slot />
  </div>
</template>

<script setup>
  defineOptions({
    name: 'BottomInfo'
  })
</script>
