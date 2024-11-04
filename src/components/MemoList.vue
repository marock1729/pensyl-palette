<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useMemoStore } from "../stores/memo";
import type { Memo } from "@/types";

const store = useMemoStore();
const { memos, isLoading } = storeToRefs(store);

const handleCreateMemo = async () => {
  console.log("新規作成");
  store.setSelectedMemo(null);
};

const handleSelectMemo = async (item: Memo) => {
  console.log("選択", item);
  store.setSelectedMemo(item);
};
</script>
<template>
  <div class="memo-list">
    <h2>メモ一覧</h2>
    <el-card v-if="isLoading" class="loading">
      <el-skeleton :rows="3" animated />
    </el-card>
    <template v-else>
      <el-menu>
        <el-menu-item @click="handleCreateMemo">新規作成</el-menu-item>
        <el-menu-item
          v-for="item in memos"
          :key="item.id!"
          @click="handleSelectMemo(item)"
        >
          {{ item.title }}
        </el-menu-item>
      </el-menu>
    </template>
  </div>
</template>
<style>
.memo-list {
  height: 100%;
}
</style>
