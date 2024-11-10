<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useMemoStore } from "../stores/memo";
import { MenuItemRegistered } from "element-plus/lib/components/menu/src/types";

const store = useMemoStore();
const { memos, isLoading } = storeToRefs(store);

const handleCreateMemo = async (_item: MenuItemRegistered) => {
  console.log("新規作成");
  store.setSelectedMemo(null);
};

const handleSelectMemo = async (item: MenuItemRegistered) => {
  console.log("選択", item);
  store.setSelectedMemo(
    memos.value.find((memo) => memo.id === Number(item.index)) ?? null
  );
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
        <el-menu-item key="create" index="create" @click="handleCreateMemo"
          >新規作成</el-menu-item
        >
        <el-menu-item
          v-for="item in memos"
          :key="item.id!"
          :index="item.id!.toString()"
          @click="handleSelectMemo"
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
