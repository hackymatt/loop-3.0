import type { EditorInFocus, DirectiveNode } from "@mdxeditor/editor";

import {
  UndoRedo,
  Separator,
  CodeToggle,
  CreateLink,
  ListsToggle,
  InsertImage,
  InsertTable,
  InsertSandpack,
  BlockTypeSelect,
  InsertCodeBlock,
  ShowSandpackInfo,
  InsertAdmonition,
  InsertFrontmatter,
  ConditionalContents,
  InsertThematicBreak,
  ChangeAdmonitionType,
  DiffSourceToggleWrapper,
  ChangeCodeMirrorLanguage,
  BoldItalicUnderlineToggles,
} from "@mdxeditor/editor";

function whenInAdmonition(editorInFocus: EditorInFocus | null) {
  const node = editorInFocus?.rootNode;
  if (!node || node.getType() !== "directive") {
    return false;
  }

  return ["note", "tip", "danger", "info", "caution"].includes(
    (node as DirectiveNode).getMdastNode().name
  );
}

export const Toolbar = () => (
  <DiffSourceToggleWrapper>
    <ConditionalContents
      options={[
        {
          when: (editor) => editor?.editorType === "codeblock",
          contents: () => <ChangeCodeMirrorLanguage />,
        },
        {
          when: (editor) => editor?.editorType === "sandpack",
          contents: () => <ShowSandpackInfo />,
        },
        {
          fallback: () => (
            <>
              <UndoRedo />
              <Separator />
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <Separator />
              <ListsToggle />
              <Separator />

              <ConditionalContents
                options={[
                  {
                    when: whenInAdmonition,
                    contents: () => <ChangeAdmonitionType />,
                  },
                  { fallback: () => <BlockTypeSelect /> },
                ]}
              />

              <Separator />

              <CreateLink />
              <InsertImage />

              <Separator />

              <InsertTable />
              <InsertThematicBreak />

              <Separator />
              <InsertCodeBlock />
              <InsertSandpack />

              <ConditionalContents
                options={[
                  {
                    when: (editorInFocus) => !whenInAdmonition(editorInFocus),
                    contents: () => (
                      <>
                        <Separator />
                        <InsertAdmonition />
                      </>
                    ),
                  },
                ]}
              />

              <Separator />
              <InsertFrontmatter />
            </>
          ),
        },
      ]}
    />
  </DiffSourceToggleWrapper>
);
