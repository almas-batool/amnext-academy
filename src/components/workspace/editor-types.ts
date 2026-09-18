// ======================================================
// Shared Editor Types
// Used across the Coding Workspace
// ======================================================
//src/components/workspace/editor-types.ts

export type EditorTheme = "vs-dark" | "light" | "hc-black";

export type SupportedLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "cpp"
  | "c"
  | "go"
  | "rust"
  | "php";

export interface LanguageOption {
  id: number; // Judge0 Language ID
  value: SupportedLanguage;
  label: string;
  extension: string;
  monaco: string;
  version: string;
}

export interface ConsoleOutput {
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  status?: string;
  runtime?: string;
  memory?: string;
}

export interface SubmissionResult {
  id: string;

  status:
    | "ACCEPTED"
    | "WRONG_ANSWER"
    | "TIME_LIMIT"
    | "RUNTIME_ERROR"
    | "COMPILE_ERROR"
    | "PENDING";

  runtime?: number;
  memory?: number;

  createdAt: string;
}

export interface TestCaseResult {
  input: string;

  expectedOutput: string;

  actualOutput: string;

  passed: boolean;
}

export interface EditorSettings {
  language: SupportedLanguage;

  theme: EditorTheme;

  fontSize: number;

  wordWrap: boolean;

  minimap: boolean;

  tabSize: number;

  autoSave: boolean;
}

export const DEFAULT_SNIPPETS = {
  javascript: `function solution() {

}`,
  typescript: `function solution(): void {

}`,
  python: `def solution():

    pass`,
  java: `public class Main {

    public static void main(String[] args){

    }

}`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main(){

}`,
  c: `#include <stdio.h>

int main(){

}`,
  go: `package main

import "fmt"

func main(){

}`,
  rust: `fn main() {

}`,
  php: `<?php

`,
} as const;

