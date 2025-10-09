"use client";

import "@mdxeditor/editor/style.css";

import type { MDXEditorMethods } from "@mdxeditor/editor";

import { forwardRef } from "react";
import { MDXEditor } from "@mdxeditor/editor";
import { useTranslation } from "react-i18next";

import { toolbar, usePlugins } from "../markdown/pluggins";

// ----------------------------------------------------------------------

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MarkdownEditor = forwardRef<MDXEditorMethods | null, EditorProps>(
  ({ value, onChange, ...otherProps }, ref) => {
    const { t } = useTranslation("markdown");
    const plugins = usePlugins();
    const allPlugins = [toolbar, ...plugins];
    return (
      <MDXEditor
        onChange={onChange}
        ref={ref}
        markdown={value}
        plugins={allPlugins}
        translation={(key, defaultValue, options) => t(key, { ...options, defaultValue })}
        {...otherProps}
      />
    );
  }
);

MarkdownEditor.displayName = "MarkdownEditor";
