// ============================================================================
// HEADER COMPONENT TYPES 
// ============================================================================

import { IconName } from '../icon/icon.types';

export interface HeaderConfig {
  // Navigation
  showNav?: boolean;
  navItems?: NavItem[];
  activeRoute?: string;
  
  // CTA Buttons
  showLoginButton?: boolean;
  showRegisterButton?: boolean;
  loginText?: string;
  registerText?: string;
  
  // Logo
  logoUrl?: string;
  logoAlt?: string;
  homeUrl?: string;
  
  // User
  isAuthenticated?: boolean;
  userData?: UserMenuData;
  showUserMenu?: boolean;
  
  // Search
  showSearch?: boolean;
  
  // Notifications
  notificationCount?: number;
  
  // Scroll Behavior
  shrinkOnScroll?: boolean;
  hideOnScrollDown?: boolean;
  scrollThreshold?: number;
  
  // Styling
  fixed?: boolean;
  transparent?: boolean;
  bgColor?: string;
}

export interface NavItem {
  label: string;
  url?: string;
  route?: string;
  external?: boolean;
  iconName?: IconName;  
  badge?: string | number;
  children?: NavItem[];
}

export interface UserMenuData {
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  menuItems?: UserMenuItem[];
}

export interface UserMenuItem {
  label: string;
  iconName?: IconName;  
  url?: string;
  route?: string;
  action?: () => void;
  divider?: boolean;
}

export type HeaderVariant = 'default' | 'transparent' | 'fixed' | 'shrink';
export type HeaderSize = 'default' | 'compact';

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_USER_MENU_ITEMS: UserMenuItem[] = [
  {
    label: 'Mein Profil',
    iconName: 'user',
    route: '/profile',
  },
  {
    label: 'Meine Buchungen',
    iconName: 'calendar',
    route: '/bookings',
  },
  {
    label: 'Favoriten',
    iconName: 'heart',
    route: '/favorites',
  },
  {
    label: 'Einstellungen',
    iconName: 'settings',
    route: '/settings',
  },
  {
    label: 'Abmelden',
    iconName: 'log-out',
    divider: true,
  },
];

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    label: 'Kurse',
    route: '/courses',
    iconName: 'calendar',
  },
  {
    label: 'Über uns',
    route: '/about',
    iconName: 'heart',
  },
  {
    label: 'Kontakt',
    route: '/kontakt',
    iconName: 'mail',
  },
];