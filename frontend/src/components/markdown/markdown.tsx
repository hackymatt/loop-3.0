import "@mdxeditor/editor/style.css";
import "./styles.css";

import React from "react";
import { MDXEditor } from "@mdxeditor/editor";

import { useTheme } from "@mui/material/styles";

import { usePlugins } from "./pluggins";

// ----------------------------------------------------------------------

type MarkdownProps = {
  content: string;
};

export function Markdown({ content, ...other }: MarkdownProps) {
  const theme = useTheme();
  const plugins = usePlugins();

  const themeClass =
    theme.palette.mode === "dark" ? "dark-theme read-only" : "light-theme read-only";

  return (
    <MDXEditor markdown={content} plugins={plugins} readOnly className={themeClass} {...other} />
  );
}
