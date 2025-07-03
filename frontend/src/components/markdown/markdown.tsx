import "@mdxeditor/editor/style.css";
import "./styles.css";

import React from "react";
import { MDXEditor } from "@mdxeditor/editor";

import { useTheme } from "@mui/material/styles";

import { plugins } from "../markdown-editor/pluggins";

// ----------------------------------------------------------------------

type MarkdownProps = {
  content: string;
};

export function Markdown({ content, ...other }: MarkdownProps) {
  const theme = useTheme();

  const themeClass = theme.palette.mode === "dark" ? "dark-theme" : "light-theme";

  return (
    <MDXEditor markdown={content} plugins={plugins} readOnly className={themeClass} {...other} />
  );
}
