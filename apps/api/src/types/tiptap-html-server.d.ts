declare module '@tiptap/html/server' {
  import type { Extensions, JSONContent } from '@tiptap/core';
  import type { ParseOptions } from '@tiptap/pm/model';
  export function generateHTML(doc: JSONContent, extensions: Extensions): string;
  export function generateJSON(
    html: string,
    extensions: Extensions,
    options?: ParseOptions,
  ): Record<string, unknown>;
}
