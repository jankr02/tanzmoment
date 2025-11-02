// ============================================================================
// HEADER COMPONENT TYPES
// ============================================================================

export interface HeaderConfig {
  // Navigation
  showNav?: boolean;
  navItems?: NavItem[];
  
  // CTA Buttons
  showLoginButton?: boolean;
  showRegisterButton?: boolean;
  loginText?: string;
  registerText?: string;
  
  // Logo
  logoUrl?: string;
  logoAlt?: string;
  homeUrl?: string;
  
  // Styling
  fixed?: boolean;
  transparent?: boolean;
}

export interface NavItem {
  label: string;
  url?: string;
  route?: string;
  external?: boolean;
  children?: NavItem[];
}

export type HeaderVariant = 'default' | 'transparent';
