import { Extension } from "@tiptap/vue-3";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Plugin } from "@tiptap/pm/state";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { createApp } from "vue";
import { open } from "@tauri-apps/plugin-shell";

const openLink = (href: string) => {
  console.log("Opening link", href);
  open(href);
};

function renderWidget(href: string) {
  const a: HTMLAnchorElement = document.createElement("a");
  //a.href = href;
  a.onclick = () => openLink(href);
  a.onmousedown = (event) => {
    event.preventDefault();
  };
  // if (!isInnerLink) {
  //   a.target = "_blank";
  //   a.rel = "noreferrer";
  // }
  // span.append(a);

  // const button = document.createElement("button");
  // button.className = "link-widget-button";
  // button.type = "button"; // ボタンのデフォルトのtypeはsubmitなので、buttonに変更
  // //button.onclick = () => openLink(href);
  // button.addEventListener("click", () => openLink(href));

  const icon = createApp(FontAwesomeIcon, { icon: faArrowUpRightFromSquare });
  const wrapper = document.createElement("span");
  icon.mount(wrapper);
  a.append(wrapper);
  return a;
}

export const TiptapLinkPlugin = Extension.create({
  addProseMirrorPlugins() {
    return [
      new Plugin({
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr) {
            const { selection } = tr;

            const { $from, $to } = selection;
            const node = tr.doc.nodeAt(selection.from);

            const mark = node?.marks.find((mark) => mark.type.name === "link");

            if (!mark) return DecorationSet.empty;

            let markPos = { start: -1, end: -1 };
            tr.doc.nodesBetween($from.start(), $to.end(), (n, pos) => {
              if (node === n) {
                markPos = {
                  start: pos,
                  end: pos + Math.max(n.textContent.length, 1),
                };
                return false;
              }
              return undefined;
            });

            return DecorationSet.create(tr.doc, [
              Decoration.widget(markPos.end, renderWidget(mark.attrs.href)),
            ]);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
