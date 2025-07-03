import type { OnMount, EditorProps } from "@monaco-editor/react";

import Editor from "@monaco-editor/react";
import React, { useRef, useEffect } from "react";

import { useSuggestions } from "./suggestions";

// ----------------------------------------------------------------------

interface ILanguageExtensionPoint {
  id: string;
  aliases?: string[];
  extensions?: string[];
  filenames?: string[];
  filenamePatterns?: string[];
  firstLine?: string;
  mimetypes?: string[];
}

// ----------------------------------------------------------------------

function VbaCodeEditor({ ...other }: EditorProps) {
  const suggestions = useSuggestions();
  const providerRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (_editor, monaco) => {
    // Register VBA language only if it hasn't been registered
    const hasVba = monaco.languages
      .getLanguages()
      .some((lang: ILanguageExtensionPoint) => lang.id === "vba");

    if (!hasVba) {
      monaco.languages.register({ id: "vba" });

      monaco.languages.setMonarchTokensProvider("vba", {
        tokenizer: {
          root: [
            [
              /\b(Dim|Sub|End|If|Then|Else|For|Each|Next|Set|As|Function|Integer|String|Boolean|Object|Nothing)\b/,
              "keyword",
            ],
            [/"([^"\\]|\\.)*$/, "string.invalid"],
            [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
            [/[a-zA-Z_][\w]*/, "identifier"],
            [/[0-9]+/, "number"],
          ],
          string: [
            [/[^"]+/, "string"],
            [/""/, "string.escape"],
            [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
          ],
        },
      });

      monaco.languages.setLanguageConfiguration("vba", {
        brackets: [["(", ")"]],
        autoClosingPairs: [
          { open: '"', close: '"' },
          { open: "(", close: ")" },
        ],
        surroundingPairs: [
          { open: '"', close: '"' },
          { open: "(", close: ")" },
        ],
      });
    }

    // Register completion provider
    providerRef.current = monaco.languages.registerCompletionItemProvider("vba", {
      triggerCharacters: [" ", "."],
      provideCompletionItems: () => ({
        suggestions,
      }),
    });
  };

  useEffect(
    () => () => {
      providerRef.current?.dispose();
    },
    []
  );

  return <Editor defaultLanguage="vba" defaultValue="" onMount={handleEditorDidMount} {...other} />;
}

export default React.memo(VbaCodeEditor);
