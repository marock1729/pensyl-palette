<script setup lang="ts">
import { onMounted } from "vue";
import { useMemoStore } from "@/stores/memo";

const memoStore = useMemoStore();

onMounted(async () => {
  await memoStore.fetchMemos();
});
</script>
<template>
  <div class="top-layout">
    <el-container>
      <el-aside width="200px">
        <el-scrollbar>
          <memo-list />
        </el-scrollbar>
      </el-aside>
      <el-main>
        <memo-form />
      </el-main>
    </el-container>
  </div>
</template>
<style lang="css">
.top-layout {
  width: 100%;
  height: 100%;
}

.el-container {
  width: 100%;
  height: 100%;
}

.el-scrollbar__view {
  height: 100%;
}
</style>
