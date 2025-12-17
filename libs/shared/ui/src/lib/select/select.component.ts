import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectSize, SelectOption } from './select.types';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  @ViewChild('triggerRef') triggerRef!: ElementRef<HTMLButtonElement>;
  @ViewChild('searchInputRef') searchInputRef!: ElementRef<HTMLInputElement>;

  // Configuration
  @Input() id?: string;
  @Input() name?: string;
  @Input() size: SelectSize = 'medium';
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Bitte auswählen';
  @Input() label?: string;
  @Input() helperText?: string;
  @Input() errorMessage?: string;

  // State
  @Input() disabled = false;
  @Input() required = false;
  @Input() hasError = false;
  @Input() searchable = false;

  // Styling
  @Input() fullWidth = false;

  // Events
  @Output() valueChange = new EventEmitter<string>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  // Internal state
  value = '';
  isOpen = false;
  isFocused = false;
  searchQuery = '';
  highlightedIndex = -1;

  // ControlValueAccessor callbacks
  private onChange: (value: string) => void = () => {
    // Will be set by registerOnChange
  };
  private onTouched: () => void = () => {
    // Default onTouched implementation
  };

  /**
   * Get container classes based on state
   */
  get containerClasses(): string[] {
    const classes = ['select', `select--${this.size}`];

    if (this.isOpen) classes.push('select--open');
    if (this.isFocused) classes.push('select--focused');
    if (this.hasError) classes.push('select--error');
    if (this.disabled) classes.push('select--disabled');
    if (this.fullWidth) classes.push('select--full-width');
    if (this.value) classes.push('select--has-value');

    return classes;
  }

  /**
   * Get filtered options based on search query
   */
  get filteredOptions(): SelectOption[] {
    if (!this.searchable || !this.searchQuery) {
      return this.options;
    }

    const query = this.searchQuery.toLowerCase();
    return this.options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  }

  /**
   * Get selected option
   */
  get selectedOption(): SelectOption | undefined {
    return this.options.find((option) => option.value === this.value);
  }

  /**
   * Get display text for trigger
   */
  get displayText(): string {
    return this.selectedOption?.label || this.placeholder;
  }

  /**
   * Get helper/error text
   */
  get helperDisplayText(): string {
    if (this.hasError && this.errorMessage) {
      return this.errorMessage;
    }
    return this.helperText || '';
  }

  /**
   * Check if should show helper text
   */
  get shouldShowHelperText(): boolean {
    return !!this.helperDisplayText;
  }

  /**
   * Toggle dropdown
   */
  toggleDropdown(): void {
    if (this.disabled) return;

    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Open dropdown
   */
  openDropdown(): void {
    if (this.disabled || this.isOpen) return;

    this.isOpen = true;
    this.searchQuery = '';
    this.highlightedIndex = this.value
      ? this.options.findIndex((o) => o.value === this.value)
      : 0;

    this.opened.emit();

    // Focus search input if searchable
    if (this.searchable) {
      setTimeout(() => {
        this.searchInputRef?.nativeElement?.focus();
      }, 0);
    }
  }

  /**
   * Close dropdown
   */
  closeDropdown(): void {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.searchQuery = '';
    this.highlightedIndex = -1;
    this.closed.emit();
  }

  /**
   * Select an option
   */
  selectOption(option: SelectOption): void {
    if (option.disabled) return;

    this.value = option.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.closeDropdown();
    this.triggerRef?.nativeElement?.focus();
  }

  /**
   * Handle search input change
   */
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.highlightedIndex = 0;
  }

  /**
   * Handle keyboard navigation
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        if (!this.isOpen) {
          event.preventDefault();
          this.openDropdown();
        } else if (this.highlightedIndex >= 0) {
          event.preventDefault();
          const option = this.filteredOptions[this.highlightedIndex];
          if (option && !option.disabled) {
            this.selectOption(option);
          }
        }
        break;

      case 'Escape':
        if (this.isOpen) {
          event.preventDefault();
          this.closeDropdown();
          this.triggerRef?.nativeElement?.focus();
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen) {
          this.openDropdown();
        } else {
          this.highlightNext();
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen) {
          this.highlightPrevious();
        }
        break;

      case 'Tab':
        if (this.isOpen) {
          this.closeDropdown();
        }
        break;

      case 'Home':
        if (this.isOpen) {
          event.preventDefault();
          this.highlightedIndex = 0;
        }
        break;

      case 'End':
        if (this.isOpen) {
          event.preventDefault();
          this.highlightedIndex = this.filteredOptions.length - 1;
        }
        break;
    }
  }

  /**
   * Highlight next option
   */
  private highlightNext(): void {
    const options = this.filteredOptions;
    let nextIndex = this.highlightedIndex + 1;

    while (nextIndex < options.length) {
      if (!options[nextIndex].disabled) {
        this.highlightedIndex = nextIndex;
        return;
      }
      nextIndex++;
    }
  }

  /**
   * Highlight previous option
   */
  private highlightPrevious(): void {
    const options = this.filteredOptions;
    let prevIndex = this.highlightedIndex - 1;

    while (prevIndex >= 0) {
      if (!options[prevIndex].disabled) {
        this.highlightedIndex = prevIndex;
        return;
      }
      prevIndex--;
    }
  }

  /**
   * Handle click outside to close
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const hostElement = this.elementRef.nativeElement as HTMLElement;

    if (!hostElement.contains(target)) {
      this.closeDropdown();
    }
  }

  /**
   * Handle focus
   */
  onFocus(): void {
    this.isFocused = true;
  }

  /**
   * Handle blur
   */
  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  constructor(private elementRef: ElementRef) {}

  // ────────────────────────────────────────────────────────────────────────────
  // ControlValueAccessor Implementation
  // ────────────────────────────────────────────────────────────────────────────

  writeValue(value: string): void {
    this.value = value || '';
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
