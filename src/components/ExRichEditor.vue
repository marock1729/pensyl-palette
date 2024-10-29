<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBold, faItalic, faStrikethrough, faUnderline } from '@fortawesome/free-solid-svg-icons';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'

const content = defineModel<String>();

const editor = useEditor({
    extensions: [
        StarterKit,
        Placeholder.configure({ placeholder: 'ここに入力してください' }),
        Text,
        TextStyle,
        Underline,
        Color,
    ],
    content: content.value,
    onUpdate: ({ editor }) => {
        // エディタの内容が変更されたときにv-modelを更新
        content.value = editor.getHTML();
    },
    editable: true,
});

onMounted(() => {
    console.log('mounted');
    // エディタの内容が変更されたときにv-modelを更新
    content.value = editor.value!.getHTML();
});

// 親コンポーネントからの変更を監視
watch(content, (newValue) => {
    console.log('content changed', newValue);

    const isSame = editor.value!.getHTML() === newValue
    if (isSame) {
        // エディタの内容とv-modelが同じ場合は何もしない
        return
    }
    editor.value!.commands.setContent(newValue!, false);
});

</script>
<template>
    <div class="editor-container">
        <bubble-menu :editor="editor" :tippy-options="{ duration: 100 }" v-if="editor" class="bubble-menu">
            <button @click="editor.chain().focus().toggleBold().run()"
                :class="{ 'is-active': editor.isActive('bold') }">
                <font-awesome-icon :icon="faBold" />
            </button>
            <button @click="editor.chain().focus().toggleItalic().run()"
                :class="{ 'is-active': editor.isActive('italic') }">
                <font-awesome-icon :icon="faItalic" />
            </button>
            <button @click="editor.chain().focus().toggleUnderline().run()"
                :class="{ 'is-active': editor.isActive('underline') }">
                <font-awesome-icon :icon="faUnderline" />
            </button>
            <button @click="editor.chain().focus().toggleStrike().run()"
                :class="{ 'is-active': editor.isActive('strike') }">
                <font-awesome-icon :icon="faStrikethrough" />
            </button>
            <button @click="editor.chain().focus().setColor('#F98181').run()"
                :class="{ 'is-active': editor.isActive('textStyle', { color: '#F98181' }) }">
                赤
            </button>
        </bubble-menu>
        <editor-content :editor="editor" />
    </div>
</template>
<style>
.editor-container {
    margin: 0 auto;
    padding: 10px;
    background-color: #fff;
}

.tiptap {
    outline: none;
}

.tiptap p {
    margin: 0 0 0.5em;
    line-height: 1.6;
    font-size: 16px;
}

.bubble-menu {
    display: flex;
    gap: 8px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 8px;
}

.bubble-menu button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
}

.bubble-menu button:hover {
    background: #f0f0f0;
}

.bubble-menu button.is-active {
    background: #f0f0f0;
}

/* Placeholder (at the top) */
p.is-editor-empty:first-child::before {
    color: gray;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
}

/* Placeholder (on every new line) */
/* .is-empty::before {
    color: var(--gray-4);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  } */
</style>
