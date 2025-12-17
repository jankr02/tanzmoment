// ============================================================================
// SELECT COMPONENT TYPES
// ============================================================================

export type SelectSize = 'small' | 'medium' | 'large';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: string;
}

export interface SelectConfig {
  // Basic
  id?: string;
  name?: string;
  size?: SelectSize;

  // Content
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  helperText?: string;
  errorMessage?: string;

  // State
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;

  // Styling
  fullWidth?: boolean;
}
