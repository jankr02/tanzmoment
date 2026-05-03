import { Injectable, Logger } from '@nestjs/common';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { generateHTML } from '@tiptap/html/server';
import type { JSONContent, Extensions } from '@tiptap/core';

@Injectable()
export class TiptapRendererService {
  private readonly logger = new Logger(TiptapRendererService.name);

  private readonly extensions: Extensions = [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Image.configure({
      allowBase64: false,
      HTMLAttributes: { class: 'tm-news-img' },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { rel: 'noopener', target: '_blank' },
    }),
  ];

  render(doc: JSONContent | null | undefined): string {
    if (!doc || !doc.type) {
      return '';
    }
    try {
      return generateHTML(doc, this.extensions);
    } catch (err) {
      this.logger.error('Failed to render Tiptap doc', err);
      return '';
    }
  }
}
