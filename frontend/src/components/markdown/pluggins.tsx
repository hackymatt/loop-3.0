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

import { usePostImage } from "src/api/project/channel/images";

import { Toolbar } from "./toolbar";

export const toolbar = toolbarPlugin({ toolbarContents: () => <Toolbar /> });

export const usePlugins = () => {
  const { mutateAsync: uploadImage } = usePostImage();
  return [
    listsPlugin(),
    quotePlugin(),
    headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({
      imageUploadHandler: async (file: File) => {
        const { url } = await uploadImage(file);
        return url;
      },
    }),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
    codeMirrorPlugin({
      codeBlockLanguages: {
        bash: "Bash (Shell)",
        csharp: "C#",
        cpp: "C++",
        css: "CSS",
        dockerfile: "Dockerfile",
        go: "Go (Golang)",
        haskell: "Haskell",
        html: "HTML",
        java: "Java",
        javascript: "JavaScript",
        json: "JSON",
        kotlin: "Kotlin",
        lua: "Lua",
        markdown: "Markdown",
        perl: "Perl",
        php: "PHP",
        powershell: "PowerShell",
        python: "Python",
        r: "R",
        ruby: "Ruby",
        rust: "Rust",
        scala: "Scala",
        swift: "Swift",
        typescript: "TypeScript",
        vba: "VBA",
        yaml: "YAML",
        txt: "Text",
      },
    }),
    directivesPlugin({
      directiveDescriptors: [AdmonitionDirectiveDescriptor],
    }),
    diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),
    markdownShortcutPlugin(),
  ];
};
