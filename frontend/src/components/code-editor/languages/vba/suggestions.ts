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
        label: "Debug.Print",
        kind: Kind.Function,
        insertText: "Debug.Print ${1:value}",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Print to Immediate Window",
      },
      {
        label: "InputBox",
        kind: Kind.Function,
        insertText: "InputBox('${1:Prompt}', '${2:Title}')",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Display an input dialog box",
      },

      // Flow Control
      {
        label: "If",
        kind: Kind.Keyword,
        insertText: "If ${1:condition} Then\n\t$0\nEnd If",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "If statement",
      },
      {
        label: "ElseIf",
        kind: Kind.Keyword,
        insertText: "ElseIf ${1:condition} Then\n\t$0",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Else if statement",
      },
      {
        label: "Else",
        kind: Kind.Keyword,
        insertText: "Else\n\t$0",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Else statement",
      },
      {
        label: "For",
        kind: Kind.Keyword,
        insertText: "For ${1:counter} = ${2:start} To ${3:end}\n\t$0\nNext ${1:counter}",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "For loop",
      },
      {
        label: "Do While",
        kind: Kind.Keyword,
        insertText: "Do While ${1:condition}\n\t$0\nLoop",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Do While loop",
      },
      {
        label: "Do Until",
        kind: Kind.Keyword,
        insertText: "Do Until ${1:condition}\n\t$0\nLoop",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Do Until loop",
      },

      // Functions and Subroutines
      {
        label: "Sub",
        kind: Kind.Keyword,
        insertText: "Sub ${1:SubName}()\n\t$0\nEnd Sub",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Define a Sub procedure",
      },
      {
        label: "Function",
        kind: Kind.Keyword,
        insertText: "Function ${1:FunctionName}(${2:arg})\n\t$0\nEnd Function",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Define a Function",
      },

      // Error Handling
      {
        label: "On Error",
        kind: Kind.Keyword,
        insertText: "On Error ${1:GoTo} ${2:Label}",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Error handling",
      },

      // Data Types
      {
        label: "Dim",
        kind: Kind.Keyword,
        insertText: "Dim ${1:variableName} As ${2:String}",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Declare a variable",
      },

      // Collections/Arrays
      {
        label: "Array",
        kind: Kind.Snippet,
        insertText: "Dim ${1:ArrayName}(1 To ${2:Size}) As ${3:Integer}",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Declare an array",
      },

      // Built-in Functions
      {
        label: "MsgBox",
        kind: Kind.Function,
        insertText: "MsgBox ${1:Message}, ${2:vbOKOnly}, ${3:Title}",
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Display a message box",
      },
      {
        label: "Range",
        kind: Kind.Function,
        insertText: 'Range("${1:CellAddress}")',
        insertTextRules: Rule.InsertAsSnippet,
        documentation: "Reference a cell or range",
      },

      // Loops and Control
      {
        label: "Exit For",
        kind: Kind.Keyword,
        insertText: "Exit For",
        documentation: "Exit a For loop",
      },
      {
        label: "Exit Do",
        kind: Kind.Keyword,
        insertText: "Exit Do",
        documentation: "Exit a Do loop",
      },
    ];
  }, [monaco]);
};
