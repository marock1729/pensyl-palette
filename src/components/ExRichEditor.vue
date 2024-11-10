<script setup lang="ts">
import { watch, onMounted } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faBold,
  faItalic,
  faStrikethrough,
  faUnderline,
  faLink,
  faLinkSlash,
} from "@fortawesome/free-solid-svg-icons";
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
//import Text from "@tiptap/extension-text";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
//import Link from "@tiptap/extension-link";
import { linkExtension } from "./plugins/TiptapLinkExtension";
import { TiptapLinkPlugin } from "./plugins/TiptapLinkPlugin";

const pureText = defineModel("pure-text", {
  type: String,
  default: "",
});
const content = defineModel("content", {
  type: String,
  default: "",
});
const props = defineProps<{
  placeholder: string;
}>();

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: props.placeholder }),
    // Text,
    TextStyle,
    Underline,
    Color,
    // Link.configure({
    //   openOnClick: false,
    //   HTMLAttributes: {
    //     // tauriでopenOnClick:falseが効かない。target="_self"で代用
    //     target: "_self",
    //   },
    // }),
    linkExtension,
    TiptapLinkPlugin,
  ],
  content: content.value,
  onUpdate: ({ editor }) => {
    // エディタの内容が変更されたときにv-modelを更新
    content.value = editor.getHTML();
    pureText.value = editor.getText();
  },
  editable: true,
});

const setLink = () => {
  console.log("setLink");
  const previousUrl = editor.value!.getAttributes("link").href;
  const url = window.prompt("URL", previousUrl);

  // cancelled
  if (url === null) {
    return;
  }

  // empty
  if (url === "") {
    editor.value!.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  editor
    .value!.chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
};
onMounted(() => {
  console.log("mounted");
  // エディタの内容が変更されたときにv-modelを更新
  content.value = editor.value!.getHTML();
  pureText.value = editor.value!.getText();
});

// 親コンポーネントからの変更を監視
watch(content, (newValue) => {
  console.log("content changed", newValue);

  const isSame = editor.value!.getHTML() === newValue;
  if (isSame) {
    // エディタの内容とv-modelが同じ場合は何もしない
    return;
  }
  editor.value!.commands.setContent(newValue!, false);
});
</script>
<template>
  <div class="editor-container">
    <bubble-menu
      :editor="editor"
      :tippy-options="{ duration: 100 }"
      v-if="editor"
      class="bubble-menu"
    >
      <button
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
        type="button"
      >
        <font-awesome-icon :icon="faBold" />
      </button>
      <button
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
        type="button"
      >
        <font-awesome-icon :icon="faItalic" />
      </button>
      <button
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="{ 'is-active': editor.isActive('underline') }"
        type="button"
      >
        <font-awesome-icon :icon="faUnderline" />
      </button>
      <button
        @click="editor.chain().focus().toggleStrike().run()"
        :class="{ 'is-active': editor.isActive('strike') }"
        type="button"
      >
        <font-awesome-icon :icon="faStrikethrough" />
      </button>
      <button
        @click="setLink"
        :class="{ 'is-active': editor.isActive('link') }"
        type="button"
      >
        <font-awesome-icon :icon="faLink" />
      </button>
      <button
        v-if="editor.isActive('link')"
        @click="
          editor.chain().focus().extendMarkRange('link').unsetLink().run()
        "
        type="button"
      >
        <font-awesome-icon :icon="faLinkSlash" />
      </button>

      <button
        @click="editor.chain().focus().setColor('#F98181').run()"
        :class="{
          'is-active': editor.isActive('textStyle', { color: '#F98181' }),
        }"
        type="button"
      >
        赤
      </button>
    </bubble-menu>
    <editor-content :editor="editor" />
  </div>
</template>
<style>
.editor-container {
  margin: 0 auto;
  padding: 0;
  background-color: #fff;
  width: 100%;
}

.tiptap {
  /* outline: none; */
  outline: 1px solid #ddd;
  padding: 6px 11px;
  border-radius: 4px;
  color: #606266;
  overflow-y: auto;
  min-height: 300px;
}

.tiptap:focus {
  outline: 1px solid #409eff;
}

.tiptap p {
  margin: 0 0 0.5em;
  line-height: 1.6;
  font-size: 16px;
}

.tiptap ul {
  padding: 0 2rem;
}

.tiptap ::selection {
  display: inline;
  background-color: rgba(0, 0, 0, 0.1);
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

.link-widget-button {
  background: none;
  border: none;
  cursor: pointer;
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
