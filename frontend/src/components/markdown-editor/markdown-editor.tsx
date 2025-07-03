"use client";

import "@mdxeditor/editor/style.css";

import type { MDXEditorMethods } from "@mdxeditor/editor";

import { forwardRef } from "react";
import { MDXEditor } from "@mdxeditor/editor";

import { allPlugins } from "./pluggins";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MarkdownEditor = forwardRef<MDXEditorMethods | null, EditorProps>(
  ({ value, onChange, ...otherProps }, ref) => (
    <MDXEditor
      onChange={onChange}
      ref={ref}
      markdown={value}
      plugins={allPlugins}
      {...otherProps}
    />
  )
);

MarkdownEditor.displayName = "MarkdownEditor";
