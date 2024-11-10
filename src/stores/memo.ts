import { defineStore } from 'pinia';
import Database from '@tauri-apps/plugin-sql';
import { ref } from 'vue';
import type { Memo } from '@/types/memo';

const getDb = async () => {
    return await Database.load("sqlite:pensyl_palette.db");
}

export const useMemoStore = defineStore('memo', () => {
    const memos = ref<Memo[]>([]);
    const selectedMemo = ref<Memo | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const fetchMemos = async () => {
        isLoading.value = true;
        try {
            const db = await getDb();
            memos.value = await db.select<Memo[]>("SELECT id, title, content, search FROM memo ORDER BY updated_at DESC");
        } catch (e) {
            error.value = 'メモの取得に失敗しました';
        } finally {
            isLoading.value = false;
        }
    };

    const addMemo = async (memo: Memo) => {
        try {
            const db = await getDb();
            const result = await db.execute("INSERT INTO memo (title, content, search) VALUES (?, ?, ?)", [memo.title, memo.content, memo.search]);
            // 再取得
            const newMemo = await db.select<Memo[]>("SELECT id, title, content, search FROM memo WHERE id = ?", [result.lastInsertId]);
            // 先頭に追加
            memos.value.unshift(newMemo[0]);

            return newMemo[0];
        } catch (e) {
            error.value = 'メモの追加に失敗しました';
            return null;
        }
    };

    const updateMemo = async (memo: Memo) => {
        try {
            const db = await getDb();
            await db.execute("UPDATE memo SET title = ?, content = ?, search = ? WHERE id = ?", [memo.title, memo.content, memo.search, memo.id]);
            const index = memos.value.findIndex((m) => m.id === memo.id);
            if (index !== -1) {
                memos.value[index] = memo;
            }
        } catch (e) {
            error.value = 'メモの更新に失敗しました';
        }
    };

    const deleteMemo = async (id: number) => {
        try {
            const db = await getDb();
            await db.execute("DELETE FROM memo WHERE id = ?", [id]);
            memos.value = memos.value.filter((memo) => memo.id !== id);
        } catch (e) {
            error.value = 'メモの削除に失敗しました';
        }
    };

    const setSelectedMemo = (memo: Memo | null) => {
        selectedMemo.value = memo;
    }

    return {
        memos,
        selectedMemo,
        isLoading,
        error,
        fetchMemos,
        addMemo,
        updateMemo,
        deleteMemo,
        setSelectedMemo,
    };
});