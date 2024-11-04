<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Database from '@tauri-apps/plugin-sql';

type Memo = {
  id: number;
  title: string;
  content: string;
  search: string;
};
var memos = ref<Memo[]>([]);
memos.value.push({ id: 1, title: "メモ1", content: "メモ1の内容", search: "メモ1 メモ1の内容" });
onMounted(async () => {
  const db = await Database.load("sqlite:pensyl_palette.db");
  memos.value = await db.select<Memo[]>("SELECT id, title, content, search FROM memo ORDER BY updated_at DESC");
});

const selectedMemoIndex = ref(0);

const selectedMemo = computed(() => {
  return memos.value[selectedMemoIndex.value];
});

const selectMemo = (index: number) => {
  selectedMemoIndex.value = index;
};

</script>

<template>
  <el-container>
    <el-aside width="200px">
      <el-menu>
        <el-menu-item v-for="(memo, index) in memos" :key="index" @click="selectMemo(index)">
          {{ memo.title }}
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <el-input v-model="selectedMemo.content" />
      <el-input v-model="selectedMemo.title" placeholder="タイトル" />
      <ex-rich-editor v-model="selectedMemo.content" />
      <el-button type="primary">保存</el-button>
    </el-main>
  </el-container>
</template>
