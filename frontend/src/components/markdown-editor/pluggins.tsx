import {
  linkPlugin,
  listsPlugin,
  quotePlugin,
  imagePlugin,
  tablePlugin,
  toolbarPlugin,
  headingsPlugin,
  codeBlockPlugin,
  linkDialogPlugin,
  codeMirrorPlugin,
  directivesPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  AdmonitionDirectiveDescriptor,
} from "@mdxeditor/editor";

import { Toolbar } from "./toolbar";

export const toolbar = toolbarPlugin({ toolbarContents: () => <Toolbar /> });

export const plugins = [
  listsPlugin(),
  quotePlugin(),
  headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
  linkPlugin(),
  linkDialogPlugin(),
  imagePlugin(),
  tablePlugin(),
  thematicBreakPlugin(),
  frontmatterPlugin(),
  codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
  codeMirrorPlugin({
    codeBlockLanguages: {
      txt: "Tekst",
      javascript: "JavaScript",
      python: "Python",
      java: "Java",
      cpp: "C++",
      csharp: "C#",
      html: "HTML",
      css: "CSS",
      sql: "SQL",
      bash: "Bash (Shell)",
      php: "PHP",
      go: "Go (Golang)",
      ruby: "Ruby",
      rust: "Rust",
      kotlin: "Kotlin",
      swift: "Swift",
      r: "R",
      typescript: "TypeScript",
      yaml: "YAML",
      json: "JSON",
      dockerfile: "Dockerfile",
      markdown: "Markdown",
      powershell: "PowerShell",
      perl: "Perl",
      lua: "Lua",
      haskell: "Haskell",
      scala: "Scala",
      vba: "VBA",
    },
  }),
  directivesPlugin({
    directiveDescriptors: [AdmonitionDirectiveDescriptor],
  }),
  diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),
  markdownShortcutPlugin(),
];

export const allPlugins = [toolbar, ...plugins];
