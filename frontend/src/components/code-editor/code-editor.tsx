import { debounce } from "es-toolkit";
import { useMonaco } from "@monaco-editor/react";
import React, { lazy, useMemo, Suspense, useEffect, useCallback } from "react";

import { useTheme } from "@mui/material/styles";
import { CircularProgress } from "@mui/material";
// Dynamically import language-specific editors
const VbaCodeEditor = lazy(() => import("./languages/vba/code-editor"));
const PythonCodeEditor = lazy(() => import("./languages/python/code-editor"));

interface CodeEditorProps {
  value: string;
  technology: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({ value, technology, readOnly = false, onChange }: CodeEditorProps) {
  const theme = useTheme();
  const monaco = useMonaco();

  // Debounce the onChange handler
  const debouncedOnChange = useMemo(
    () =>
      debounce((newValue: string) => {
        onChange(newValue);
      }, 150),
    [onChange]
  );

  // Cleanup debounce on unmount
  useEffect(
    () => () => {
      debouncedOnChange.cancel();
    },
    [debouncedOnChange]
  );

  const handleEditorChange = useCallback(
    (newValue?: string) => {
      if (typeof newValue === "string") {
        debouncedOnChange(newValue);
      }
    },
    [debouncedOnChange]
  );

  // Memoize theme effect
  useEffect(() => {
    if (monaco) {
      const currentTheme = theme.palette.mode === "dark" ? "vs-dark" : "vs";
      monaco.editor.setTheme(currentTheme);
    }
  }, [monaco, theme.palette.mode]);

  const editorOptions = useMemo(
    () => ({
      fontSize: 14,
      minimap: { enabled: false },
      automaticLayout: true,
      suggestOnTriggerCharacters: true,
      tabSize: 2,
      scrollBeyondLastLine: false,
      renderWhitespace: "none",
      wordWrap: "on",
      fixedOverflowWidgets: true,
    }),
    []
  );

  const technologyEditorMap = useMemo(
    () => ({
      python: PythonCodeEditor,
      vba: VbaCodeEditor,
    }),
    []
  );

  const EditorComponent = useMemo(() => {
    const component = technologyEditorMap[technology as "python"];
    if (!component) {
      throw new Error(`No editor found for technology ${technology}`);
    }
    return component;
  }, [technology, technologyEditorMap]);

  return (
    <Suspense fallback={<CircularProgress />}>
      <EditorComponent
        height="100%"
        defaultValue={value}
        onChange={handleEditorChange}
        options={{ ...editorOptions, readOnly }}
        loading={<CircularProgress />}
      />
    </Suspense>
  );
}
