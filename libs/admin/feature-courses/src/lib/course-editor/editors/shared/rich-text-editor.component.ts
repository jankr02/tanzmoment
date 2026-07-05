import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

/**
 * Minimal HTML-in / HTML-out rich text editor used by the course content
 * editors (description body, FAQ answers). Emits sanitized-on-render HTML —
 * the public sections bind it via [innerHTML], which Angular auto-sanitizes.
 */
@Component({
  selector: 'admin-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RichTextEditorComponent implements AfterViewInit, OnDestroy {
  @Input() html = '';
  @Input() placeholder = 'Text eingeben…';
  @Output() readonly htmlChange = new EventEmitter<string>();

  @ViewChild('editorEl', { static: true })
  private readonly editorEl!: ElementRef<HTMLDivElement>;

  private editor: Editor | null = null;
  readonly activeMarks = signal<Record<string, boolean>>({});

  ngAfterViewInit(): void {
    this.editor = new Editor({
      element: this.editorEl.nativeElement,
      extensions: [
        StarterKit.configure({ heading: { levels: [3] } }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener', target: '_blank' },
        }),
        Placeholder.configure({ placeholder: this.placeholder }),
      ],
      content: this.html || '',
      onUpdate: () => this.emitChange(),
      onSelectionUpdate: () => this.refreshActiveMarks(),
      onCreate: () => this.refreshActiveMarks(),
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
    this.editor = null;
  }

  toggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }
  toggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }
  toggleHeading(): void {
    this.editor?.chain().focus().toggleHeading({ level: 3 }).run();
  }
  toggleBulletList(): void {
    this.editor?.chain().focus().toggleBulletList().run();
  }
  toggleOrderedList(): void {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  setLink(): void {
    if (!this.editor) return;
    const previousUrl = this.editor.getAttributes('link')['href'] as
      | string
      | undefined;
    const url = window.prompt(
      'Link-URL (leer = entfernen)',
      previousUrl ?? 'https://',
    );
    if (url === null) return;
    if (url === '') {
      this.editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    this.editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
  }

  isActive(name: string): boolean {
    return Boolean(this.editor?.isActive(name));
  }

  private refreshActiveMarks(): void {
    if (!this.editor) return;
    this.activeMarks.set({
      bold: this.editor.isActive('bold'),
      italic: this.editor.isActive('italic'),
      heading: this.editor.isActive('heading', { level: 3 }),
      bulletList: this.editor.isActive('bulletList'),
      orderedList: this.editor.isActive('orderedList'),
      link: this.editor.isActive('link'),
    });
  }

  private emitChange(): void {
    if (!this.editor) return;
    this.htmlChange.emit(this.editor.isEmpty ? '' : this.editor.getHTML());
  }
}
