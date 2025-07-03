import { useMemo } from "react";
import { useMonaco } from "@monaco-editor/react";

export const useSuggestions = () => {
  const monaco = useMonaco();

  return useMemo(() => {
    if (!monaco) return [];

    const Kind = monaco.languages.CompletionItemKind;
    const Rule = monaco.languages.CompletionItemInsertTextRule;

    return [
      // Basics
      {
        label: "print",
        kind: Kind.Function,
        insertText: "print($1)",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Print to console",
      },
      {
        label: "input",
        kind: Kind.Function,
        insertText: "input('$1')",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Get user input from the console",
      },

      // Imports
      {
        label: "import",
        kind: Kind.Keyword,
        insertText: "import ",
        documentation: "Import a module",
      },
      {
        label: "from ... import ...",
        kind: Kind.Snippet,
        insertText: "from ${1:module} import ${2:object}",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Import specific object from a module",
      },

      // Flow Control
      {
        label: "if",
        kind: Kind.Keyword,
        insertText: "if ${1:condition}:\n\t$0",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "If statement",
      },
      {
        label: "elif",
        kind: Kind.Keyword,
        insertText: "elif ${1:condition}:\n\t$0",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Else if statement",
      },
      {
        label: "else",
        kind: Kind.Keyword,
        insertText: "else:\n\t$0",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Else statement",
      },
      {
        label: "for",
        kind: Kind.Keyword,
        insertText: "for ${1:item} in ${2:iterable}:\n\t$0",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "For loop",
      },
      {
        label: "while",
        kind: Kind.Keyword,
        insertText: "while ${1:condition}:\n\t$0",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "While loop",
      },

      // Functions and Classes
      {
        label: "def",
        kind: Kind.Keyword,
        insertText: "def ${1:func_name}($2):\n\t$0",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Define a function",
      },
      {
        label: "class",
        kind: Kind.Keyword,
        insertText: "class ${1:ClassName}($2):\n\tdef __init__(self):\n\t\t$0",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Define a class",
      },

      // Try/Except
      {
        label: "try/except",
        kind: Kind.Snippet,
        insertText: "try:\n\t$1\nexcept ${2:Exception} as e:\n\t$0",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Try/Except block for error handling",
      },

      // Data Structures
      {
        label: "list comprehension",
        kind: Kind.Snippet,
        insertText: "[${1:expr} for ${2:item} in ${3:iterable}]",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "List comprehension",
      },
      {
        label: "dictionary",
        kind: Kind.Snippet,
        insertText: "{ '${1:key}': ${2:value} }",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Dictionary",
      },

      // Built-in Modules
      {
        label: "os",
        kind: Kind.Module,
        insertText: "import os",
        documentation: "OS module",
      },
      {
        label: "sys",
        kind: Kind.Module,
        insertText: "import sys",
        documentation: "Sys module",
      },
      {
        label: "math",
        kind: Kind.Module,
        insertText: "import math",
        documentation: "Math module",
      },
      {
        label: "random",
        kind: Kind.Module,
        insertText: "import random",
        documentation: "Random module",
      },
      {
        label: "datetime",
        kind: Kind.Module,
        insertText: "import datetime",
        documentation: "Datetime module",
      },

      // File I/O
      {
        label: "open file",
        kind: Kind.Function,
        insertText: "with open('${1:filename}', '${2:r}') as f:\n\t$0",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Open a file using context manager",
      },
    ];
  }, [monaco]);
};
