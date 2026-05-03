import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { AdminNewsService } from '@tanzmoment/admin/data-access';

export interface TiptapBodyChange {
  json: Record<string, unknown>;
  html: string;
}

@Component({
  selector: 'admin-tiptap-editor',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tiptap-editor.component.html',
  styleUrl: './tiptap-editor.component.scss',
})
export class TiptapEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  private readonly api = inject(AdminNewsService);

  @Input() initialJson: Record<string, unknown> | null = null;
  @Input() placeholder = 'Beginne hier zu schreiben…';
  @Output() bodyChange = new EventEmitter<TiptapBodyChange>();

  @ViewChild('editorEl', { static: true }) private readonly editorEl!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput', { static: true }) private readonly fileInput!: ElementRef<HTMLInputElement>;

  private editor: Editor | null = null;
  readonly uploading = signal(false);
  readonly activeMarks = signal<Record<string, boolean>>({});

  ngAfterViewInit(): void {
    this.editor = new Editor({
      element: this.editorEl.nativeElement,
      extensions: [
        StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
        Image.configure({
          allowBase64: false,
          HTMLAttributes: { class: 'tm-news-img' },
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener', target: '_blank' },
        }),
        Placeholder.configure({ placeholder: this.placeholder }),
      ],
      content: this.initialJson ?? { type: 'doc', content: [{ type: 'paragraph' }] },
      onUpdate: () => this.emitChange(),
      onSelectionUpdate: () => this.refreshActiveMarks(),
      onCreate: () => this.refreshActiveMarks(),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialJson'] && this.editor && !changes['initialJson'].firstChange) {
      const next = changes['initialJson'].currentValue;
      if (next) {
        this.editor.commands.setContent(next, { emitUpdate: false });
      }
    }
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
    this.editor = null;
  }

  toggleBold(): void { this.editor?.chain().focus().toggleBold().run(); }
  toggleItalic(): void { this.editor?.chain().focus().toggleItalic().run(); }
  toggleHeading(level: 1 | 2 | 3): void {
    this.editor?.chain().focus().toggleHeading({ level }).run();
  }
  toggleBulletList(): void { this.editor?.chain().focus().toggleBulletList().run(); }
  toggleOrderedList(): void { this.editor?.chain().focus().toggleOrderedList().run(); }
  toggleBlockquote(): void { this.editor?.chain().focus().toggleBlockquote().run(); }

  setLink(): void {
    if (!this.editor) return;
    const previousUrl = this.editor.getAttributes('link')['href'] as string | undefined;
    const url = window.prompt('Link-URL eingeben (leer = Link entfernen)', previousUrl ?? 'https://');
    if (url === null) return;
    if (url === '') {
      this.editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  undo(): void { this.editor?.chain().focus().undo().run(); }
  redo(): void { this.editor?.chain().focus().redo().run(); }

  triggerImageUpload(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.editor) return;

    this.uploading.set(true);
    this.api.uploadInline(file).subscribe({
      next: (res) => {
        this.editor?.chain().focus().setImage({ src: res.url, alt: file.name }).run();
        this.uploading.set(false);
        input.value = '';
      },
      error: () => {
        this.uploading.set(false);
        input.value = '';
        window.alert('Bild-Upload fehlgeschlagen.');
      },
    });
  }

  isActive(name: string, attrs?: Record<string, unknown>): boolean {
    return Boolean(this.editor?.isActive(name, attrs));
  }

  private refreshActiveMarks(): void {
    if (!this.editor) return;
    this.activeMarks.set({
      bold: this.editor.isActive('bold'),
      italic: this.editor.isActive('italic'),
      h1: this.editor.isActive('heading', { level: 1 }),
      h2: this.editor.isActive('heading', { level: 2 }),
      h3: this.editor.isActive('heading', { level: 3 }),
      bulletList: this.editor.isActive('bulletList'),
      orderedList: this.editor.isActive('orderedList'),
      blockquote: this.editor.isActive('blockquote'),
      link: this.editor.isActive('link'),
    });
  }

  private emitChange(): void {
    if (!this.editor) return;
    this.bodyChange.emit({
      json: this.editor.getJSON() as Record<string, unknown>,
      html: this.editor.getHTML(),
    });
  }
}
