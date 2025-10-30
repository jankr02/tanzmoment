import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { InputType, InputSize } from './input.types';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  // Configuration
  @Input() id?: string;
  @Input() name?: string;
  @Input() type: InputType = 'text';
  @Input() size: InputSize = 'medium';
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
  @Input() loading = false; // NEW: Loading state
  
  // Validation
  @Input() minLength?: number;
  @Input() maxLength?: number;
  @Input() pattern?: string;
  
  // Icons & Actions
  @Input() iconLeft?: string;
  @Input() iconRight?: string;
  @Input() showSearchIcon = false;
  @Input() showPasswordToggle = false; // NEW: Password visibility toggle
  @Input() showClearButton = false; // NEW: Clear button (auto-enabled for search)
  
  // Additional Features
  @Input() prefix?: string; // NEW: Text prefix (e.g. "https://")
  @Input() suffix?: string; // NEW: Text suffix (e.g. ".com")
  @Input() showCharCounter = false; // NEW: Character counter
  @Input() autocomplete?: string; // NEW: Autocomplete attribute
  @Input() debounceTime = 0; // NEW: Debounce input (ms)
  @Input() autofocus = false; // NEW: Auto-focus on mount
  
  // Styling
  @Input() fullWidth = false;
  
  // Events
  @Output() valueChange = new EventEmitter<string>();
  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();
  @Output() cleared = new EventEmitter<void>(); // NEW: Clear event
  
  // Internal state
  value = '';
  isFocused = false;
  showPassword = false; // For password toggle
  private debounceTimer?: number;
  
  // ControlValueAccessor
  // Placeholder for ControlValueAccessor; will be replaced by Angular forms
  private onChange: (value: string) => void = () => {
    // Intentionally left blank: will be set by registerOnChange
  };
  private onTouched: () => void = () => {
    // Default onTouched implementation
  };
  
  /**
   * Get actual input type (handles password toggle)
   */
  get actualType(): InputType {
    if (this.type === 'password' && this.showPassword) {
      return 'text';
    }
    return this.type;
  }
  
  /**
   * Get input classes based on state
   */
  get inputClasses(): string[] {
    const classes = [
      'input',
      `input--${this.size}`,
    ];
    
    if (this.isFocused) classes.push('input--focused');
    if (this.hasError) classes.push('input--error');
    if (this.hasSuccess) classes.push('input--success');
    if (this.disabled) classes.push('input--disabled');
    if (this.loading) classes.push('input--loading');
    if (this.fullWidth) classes.push('input--full-width');
    if (this.iconLeft || this.prefix) classes.push('input--has-icon-left');
    if (this.iconRight || this.showSearchIcon || this.shouldShowClearButton || this.shouldShowPasswordToggle || this.suffix) {
      classes.push('input--has-icon-right');
    }
    
    return classes;
  }
  
  /**
   * Check if clear button should be shown
   */
  get shouldShowClearButton(): boolean {
    return (this.showClearButton || this.type === 'search') && 
           this.value.length > 0 && 
           !this.disabled && 
           !this.readonly;
  }
  
  /**
   * Check if password toggle should be shown
   */
  get shouldShowPasswordToggle(): boolean {
    return (this.showPasswordToggle || this.type === 'password') && 
           !this.disabled && 
           !this.readonly;
  }
  
  /**
   * Get character count text
   */
  get charCountText(): string {
    if (!this.maxLength) return '';
    return `${this.value.length} / ${this.maxLength}`;
  }
  
  /**
   * Check if char count should be shown
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
    return !!(this.displayText);
  }
  
  /**
   * Handle input value change
   */
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    
    // Clear existing debounce timer
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
    }
    
    // Emit immediately for no debounce, or set timer
    if (this.debounceTime === 0) {
      this.emitChange();
    } else {
      this.debounceTimer = window.setTimeout(() => {
        this.emitChange();
      }, this.debounceTime);
    }
  }
  
  /**
   * Emit value change
   */
  private emitChange(): void {
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }
  
  /**
   * Handle input focus
   */
  onFocus(): void {
    this.isFocused = true;
    this.focused.emit();
  }
  
  /**
   * Handle input blur
   */
  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
    this.blurred.emit();
  }
  
  /**
   * Clear input value
   */
  clearInput(): void {
    this.value = '';
    this.onChange('');
    this.valueChange.emit('');
    this.cleared.emit();
  }
  
  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
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
