// ============================================================================
// INPUT COMPONENT TYPES
// ============================================================================

export type InputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';
export type InputSize = 'small' | 'medium' | 'large';
export type InputState = 'default' | 'focus' | 'error' | 'success' | 'disabled';

export interface InputConfig {
  // Basic
  id?: string;
  name?: string;
  type?: InputType;
  size?: InputSize;
  
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
  
  // Validation
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  
  // Icons
  iconLeft?: string;
  iconRight?: string;
  
  // Styling
  fullWidth?: boolean;
}

export interface TextareaConfig extends Omit<InputConfig, 'type'> {
  rows?: number;
  maxRows?: number;
  showCharCounter?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}
