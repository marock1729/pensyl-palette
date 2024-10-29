<script setup lang="ts">
import { ref, computed } from 'vue';

const memos = ref([
  { title: 'メモ1', content: 'メモ1の内容' },
  { title: 'メモ2', content: 'メモ2の内容' },
  { title: 'メモ3', content: 'メモ3の内容' },
  { title: 'メモ4', content: 'メモ4の内容' },
]);
const selectedMemoIndex = ref(0);

const selectedMemo = computed(() => {
  return memos.value[selectedMemoIndex.value];
});

const selectMemo = (index: number) => {
  selectedMemoIndex.value = index;
};

</script>

<template>
  <el-container style="height: 100vh;">
    <el-aside width="300px">
      <el-menu>
        <el-menu-item v-for="(memo, index) in memos" :key="index" @click="selectMemo(index)">
          {{ memo.title }}
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <el-input v-model="selectedMemo.title" placeholder="タイトル" />
      <ex-rich-editor v-model="selectedMemo.content" />

    </el-main>
  </el-container>
</template>
