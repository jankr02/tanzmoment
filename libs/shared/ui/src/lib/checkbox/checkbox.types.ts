// ============================================================================
// CHECKBOX COMPONENT TYPES
// ============================================================================

export type CheckboxSize = 'small' | 'medium' | 'large';

export interface CheckboxConfig {
  // Basic
  id?: string;
  name?: string;
  size?: CheckboxSize;

  // Content
  label?: string;
  helperText?: string;
  errorMessage?: string;

  // State
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  indeterminate?: boolean;

  // Styling
  labelPosition?: 'left' | 'right';
}
