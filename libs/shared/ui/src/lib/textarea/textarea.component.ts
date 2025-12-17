import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';
import { TextareaSize, TextareaResize } from './textarea.types';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent
  implements ControlValueAccessor, AfterViewInit, OnDestroy
{
  @ViewChild('textareaRef') textareaRef!: ElementRef<HTMLTextAreaElement>;

  // Configuration
  @Input() id?: string;
  @Input() name?: string;
  @Input() size: TextareaSize = 'medium';
  @Input() placeholder = '';
  @Input() label?: string;
  @Input() helperText?: string;
  @Input() errorMessage?: string;

  // State
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() hasError = false;
  @Input() hasSuccess = false;

  // Textarea specific
  @Input() rows = 4;
  @Input() minHeight?: string;
  @Input() maxHeight?: string;
  @Input() autoResize = false;
  @Input() resize: TextareaResize = 'vertical';

  // Validation
  @Input() minLength?: number;
  @Input() maxLength?: number;
  @Input() showCharCounter = false;

  // Styling
  @Input() fullWidth = false;

  // Events
  @Output() valueChange = new EventEmitter<string>();
  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();

  // Internal state
  value = '';
  isFocused = false;
  private resizeObserver?: ResizeObserver;

  // ControlValueAccessor callbacks
  private onChange: (value: string) => void = () => {
    // Will be set by registerOnChange
  };
  private onTouched: () => void = () => {
    // Default onTouched implementation
  };

  ngAfterViewInit(): void {
    if (this.autoResize) {
      this.adjustHeight();
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  /**
   * Get container classes based on state
   */
  get containerClasses(): string[] {
    const classes = ['textarea', `textarea--${this.size}`];

    if (this.isFocused) classes.push('textarea--focused');
    if (this.hasError) classes.push('textarea--error');
    if (this.hasSuccess) classes.push('textarea--success');
    if (this.disabled) classes.push('textarea--disabled');
    if (this.fullWidth) classes.push('textarea--full-width');
    if (this.autoResize) classes.push('textarea--auto-resize');

    return classes;
  }

  /**
   * Get resize style for textarea
   */
  get resizeStyle(): string {
    if (this.autoResize) return 'none';
    return this.resize;
  }

  /**
   * Get character count text
   */
  get charCountText(): string {
    if (!this.maxLength) return '';
    return `${this.value.length} / ${this.maxLength}`;
  }

  /**
   * Check if char counter should be shown
   */
  get shouldShowCharCounter(): boolean {
    return this.showCharCounter && !!this.maxLength;
  }

  /**
   * Get helper/error text to display
   */
  get displayText(): string {
    if (this.hasError && this.errorMessage) {
      return this.errorMessage;
    }
    return this.helperText || '';
  }

  /**
   * Check if should show helper text
   */
  get shouldShowHelperText(): boolean {
    return !!this.displayText;
  }

  /**
   * Check if character count is at warning threshold (90%)
   */
  get isCharCountWarning(): boolean {
    if (!this.maxLength) return false;
    return this.value.length >= this.maxLength * 0.9;
  }

  /**
   * Check if character count has reached max
   */
  get isCharCountError(): boolean {
    if (!this.maxLength) return false;
    return this.value.length >= this.maxLength;
  }

  /**
   * Handle textarea value change
   */
  onTextareaChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);

    if (this.autoResize) {
      this.adjustHeight();
    }
  }

  /**
   * Handle textarea focus
   */
  onFocus(): void {
    this.isFocused = true;
    this.focused.emit();
  }

  /**
   * Handle textarea blur
   */
  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
    this.blurred.emit();
  }

  /**
   * Adjust textarea height for auto-resize
   */
  private adjustHeight(): void {
    if (!this.textareaRef?.nativeElement) return;

    const textarea = this.textareaRef.nativeElement;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Calculate new height
    let newHeight = textarea.scrollHeight;

    // Apply min/max constraints
    if (this.minHeight) {
      const minPx = parseInt(this.minHeight, 10);
      if (!isNaN(minPx) && newHeight < minPx) {
        newHeight = minPx;
      }
    }

    if (this.maxHeight) {
      const maxPx = parseInt(this.maxHeight, 10);
      if (!isNaN(maxPx) && newHeight > maxPx) {
        newHeight = maxPx;
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    } else {
      textarea.style.overflowY = 'hidden';
    }

    textarea.style.height = `${newHeight}px`;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ControlValueAccessor Implementation
  // ────────────────────────────────────────────────────────────────────────────

  writeValue(value: string): void {
    this.value = value || '';
    if (this.autoResize && this.textareaRef?.nativeElement) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => this.adjustHeight(), 0);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
