import {
  Mark,
  markPasteRule,
  mergeAttributes,
  PasteRuleMatch,
} from "@tiptap/core";
import { find, reset } from "linkifyjs";

export interface LinkOptions {
  linkOnPaste: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    link: {
      setLink: (attributes: {
        href: string;
        target?: string | null;
        rel?: string | null;
        class?: string | null;
      }) => ReturnType;
      unsetLink: () => ReturnType;
    };
  }
}

export const linkExtension = Mark.create<LinkOptions>({
  name: "link",
  priority: 1000,
  keepOnSplit: false,
  exitable: true,
  onDestroy() {
    reset();
  },
  addOptions() {
    return {
      linkOnPaste: true,
      HTMLAttributes: {
        target: "_self",
        rel: "noopener noreferrer nofollow",
        class: null,
      },
    };
  },

  addAttributes() {
    return {
      href: {
        default: null,
        parseHTML(element) {
          return element.getAttribute("href");
        },
      },
      target: {
        default: this.options.HTMLAttributes.target,
      },
      rel: {
        default: this.options.HTMLAttributes.rel,
      },
      class: {
        default: this.options.HTMLAttributes.class,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "a[href]",
        getAttrs: (dom) => {
          const href = (dom as HTMLElement).getAttribute("href");

          if (!href) {
            return false;
          }
          return null;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "a",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setLink:
        (attributes) =>
        ({ chain }) => {
          return chain()
            .setMark(this.name, attributes)
            .setMeta("preventAutolink", true)
            .run();
        },

      unsetLink:
        () =>
        ({ chain }) => {
          return chain()
            .unsetMark(this.name, { extendEmptyMarkRange: true })
            .setMeta("preventAutolink", true)
            .run();
        },
    };
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: (text) => {
          const foundLinks: PasteRuleMatch[] = [];

          if (text) {
            const links = find(text).filter((item) => item.isLink);

            if (links.length) {
              links.forEach((link) =>
                foundLinks.push({
                  text: link.value,
                  data: {
                    href: link.href,
                  },
                  index: link.start,
                })
              );
            }
          }

          return foundLinks;
        },
        type: this.type,
        getAttributes: (match) => {
          return {
            href: match.data?.href,
          };
        },
      }),
    ];
  },
});
