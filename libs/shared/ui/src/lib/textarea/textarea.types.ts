// ============================================================================
// TEXTAREA COMPONENT TYPES
// ============================================================================

export type TextareaSize = 'small' | 'medium' | 'large';
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export interface TextareaConfig {
  // Basic
  id?: string;
  name?: string;
  size?: TextareaSize;

  // Content
  value?: string;
  placeholder?: string;
  label?: string;
  helperText?: string;
  errorMessage?: string;

  // State
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;

  // Textarea specific
  rows?: number;
  minHeight?: string;
  maxHeight?: string;
  autoResize?: boolean;
  resize?: TextareaResize;

  // Validation
  minLength?: number;
  maxLength?: number;
  showCharCounter?: boolean;

  // Styling
  fullWidth?: boolean;
}
