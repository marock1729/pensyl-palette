import {
  Mark,
  markPasteRule,
  mergeAttributes,
  PasteRuleMatch,
} from "@tiptap/core";
import { find, registerCustomProtocol, reset } from "linkifyjs";

export interface LinkProtocolOptions {
  /**
   * The protocol scheme to be registered.
   * @default '''
   * @example 'ftp'
   * @example 'git'
   */
  scheme: string;

  /**
   * If enabled, it allows optional slashes after the protocol.
   * @default false
   * @example true
   */
  optionalSlashes?: boolean;
}

export interface LinkOptions {
  /**
   * If enabled, the extension will automatically add links as you type.
   * @default true
   * @example false
   */
  autolink: boolean;

  /**
   * An array of custom protocols to be registered with linkifyjs.
   * @default []
   * @example ['ftp', 'git']
   */
  protocols: Array<LinkProtocolOptions | string>;

  /**
   * Default protocol to use when no protocol is specified.
   * @default 'http'
   */
  defaultProtocol: string;
  /**
   * Adds a link to the current selection if the pasted content only contains an url.
   * @default true
   * @example false
   */
  linkOnPaste: boolean;

  /**
   * HTML attributes to add to the link element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>;

  /**
   * A validation function that modifies link verification for the auto linker.
   * @param url - The url to be validated.
   * @returns - True if the url is valid, false otherwise.
   */
  validate: (url: string) => boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    link: {
      /**
       * Set a link mark
       * @param attributes The link attributes
       * @example editor.commands.setLink({ href: 'https://tiptap.dev' })
       */
      setLink: (attributes: {
        href: string;
        target?: string | null;
        rel?: string | null;
        class?: string | null;
      }) => ReturnType;
      /**
       * Unset a link mark
       * @example editor.commands.unsetLink()
       */
      unsetLink: () => ReturnType;
    };
  }
}

export const linkExtension = Mark.create<LinkOptions>({
  name: "link",

  priority: 1000,

  keepOnSplit: false,

  exitable: true,

  onCreate() {
    this.options.protocols.forEach((protocol) => {
      if (typeof protocol === "string") {
        registerCustomProtocol(protocol);
        return;
      }
      registerCustomProtocol(protocol.scheme, protocol.optionalSlashes);
    });
  },

  onDestroy() {
    reset();
  },

  inclusive() {
    return this.options.autolink;
  },

  addOptions() {
    return {
      linkOnPaste: true,
      autolink: true,
      protocols: [],
      defaultProtocol: "http",
      HTMLAttributes: {
        target: "_self",
        rel: "noopener noreferrer nofollow",
        class: null,
      },
      validate: (url) => !!url,
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

          // prevent XSS attacks
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
            const { validate } = this.options;
            const links = find(text).filter(
              (item) => item.isLink && validate(item.value)
            );

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
