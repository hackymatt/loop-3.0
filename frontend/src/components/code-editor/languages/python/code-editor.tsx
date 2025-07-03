import type { OnMount, EditorProps } from "@monaco-editor/react";

import Editor from "@monaco-editor/react";
import React, { useRef, useEffect } from "react";

import { useSuggestions } from "./suggestions";

// ----------------------------------------------------------------------

function PythonCodeEditor({ ...other }: EditorProps) {
  const suggestions = useSuggestions();
  const suggestionsRef = useRef(suggestions);
  const providerRef = useRef<any>(null);

  useEffect(() => {
    suggestionsRef.current = suggestions;
  }, [suggestions]);

  const handleEditorDidMount: OnMount = (_editor, monaco) => {
    providerRef.current = monaco.languages.registerCompletionItemProvider("python", {
      triggerCharacters: [" ", "."],
      provideCompletionItems: () => {
        try {
          return {
            suggestions: suggestionsRef.current,
          };
        } catch (error: any) {
          if (error?.name === "CancellationError") {
            return { suggestions: [] };
          }
          throw error;
        }
      },
    });
  };

  useEffect(
    () => () => {
      providerRef.current?.dispose();
    },
    []
  );

  return <Editor defaultLanguage="python" onMount={handleEditorDidMount} {...other} />;
}

export default React.memo(PythonCodeEditor);
