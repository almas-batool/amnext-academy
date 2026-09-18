//src/components/workspace/code-editor.tsx

"use client";

import { useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import { SupportedLanguage, EditorTheme } from "./editor-types";

interface Props {
  value: string;
  language: SupportedLanguage;
  theme: EditorTheme;
  fontSize: number;

  onChange: (value: string) => void;

  onSave?: () => void;
  onRun?: () => void;
}

export function CodeEditor({
  value,
  language,
  theme,
  fontSize,
  onChange,
  onSave,
  onRun,
}: Props) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;

    editor.focus();

    // Ctrl + S
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
      () => {
        onSave?.();
      },
    );

    // Ctrl + Enter
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
      () => {
        onRun?.();
      },
    );
  };

  return (
    <Editor
      height="100%"
      defaultLanguage="javascript"
      language={language}
      theme={theme}
      value={value}
      onMount={handleMount}
      onChange={(v) => onChange(v ?? "")}
      loading={
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Loading editor...
        </div>
      }
      options={{
        fontSize,

        minimap: {
          enabled: true,
        },

        automaticLayout: true,

        scrollBeyondLastLine: false,

        smoothScrolling: true,

        wordWrap: "on",

        tabSize: 2,

        insertSpaces: true,

        bracketPairColorization: {
          enabled: true,
        },

        guides: {
          bracketPairs: true,
          indentation: true,
        },

        renderWhitespace: "selection",

        cursorBlinking: "smooth",

        cursorSmoothCaretAnimation: "on",

        mouseWheelZoom: true,

        folding: true,

        formatOnPaste: true,

        formatOnType: true,

        lineNumbers: "on",

        roundedSelection: true,

        padding: {
          top: 16,
          bottom: 16,
        },
      }}
    />
  );
}
