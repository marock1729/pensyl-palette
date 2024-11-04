<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import type { Memo } from "@/types/memo";
import { useMemoStore } from "@/stores/memo";

const store = useMemoStore();
const { selectedMemo } = storeToRefs(store);

const formData = ref<Memo>({
  id: null as number | null,
  title: "",
  content: "",
  search: "",
  pureText: "",
});

const isEditing = ref(false);

const resetForm = async () => {
  formData.value = {
    id: null,
    title: "",
    content: "",
    search: "",
    pureText: "",
  };
  isEditing.value = false;
};

const deleteFrom = async () => {
  if (formData.value.id) {
    store.deleteMemo(formData.value.id);
  }
  resetForm();
};

watch(selectedMemo, async (memo) => {
  if (memo) {
    await setEditMemo(memo);
  } else {
    resetForm();
  }
});

const setEditMemo = async (memo: Memo) => {
  formData.value = { ...memo };
  isEditing.value = true;
};

const submitForm = async () => {
  if (!formData.value.title || !formData.value.content) {
    return;
  }

  if (isEditing.value && formData.value.id) {
    await store.updateMemo({
      ...(formData.value as Memo),
    });
  } else {
    const newMemo = await store.addMemo({
      id: null,
      title: formData.value.title,
      content: formData.value.content,
      search: formData.value.title + " " + formData.value.pureText,
    });

    if (newMemo) {
      store.setSelectedMemo(newMemo);
    }
  }
};
</script>

<template>
  <div class="memo-form">
    <h2>{{ isEditing ? "メモを編集" : "新規メモ作成" }}</h2>
    <el-form @submit.prevent="submitForm" label-position="top">
      <el-form-item label="タイトル">
        <el-input v-model="formData.title" placeholder="タイトルを入力" />
      </el-form-item>
      <el-form-item label="内容">
        <ex-rich-editor
          v-model:content="formData.content"
          v-model:pure-text="formData.pureText"
          placeholder="メモの内容を入力"
        />
        {{ formData.content }}
        <br />
        {{ formData.search }}
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">
          {{ isEditing ? "更新" : "作成" }}
        </el-button>
        <el-button v-if="isEditing" @click="deleteFrom" type="danger"
          >削除</el-button
        >
        <el-button v-if="isEditing" @click="resetForm">キャンセル</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
