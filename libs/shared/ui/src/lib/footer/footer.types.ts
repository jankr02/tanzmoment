// ============================================================================
// FOOTER COMPONENT TYPES
// ============================================================================

import { IconName } from '../icon/icon.types';

export interface FooterConfig {
  // Branding
  logoUrl?: string;
  logoAlt?: string;
  slogan?: string;
  homeUrl?: string;
  
  // Navigation
  navColumns?: FooterNavColumn[];
  
  // Newsletter
  showNewsletter?: boolean;
  newsletterTitle?: string;
  newsletterSubtitle?: string;
  newsletterPlaceholder?: string;
  newsletterButtonText?: string;
  
  // Contact Info
  showContactInfo?: boolean;
  contactInfo?: ContactInfo;
  
  // Social Media
  socialLinks?: SocialLink[];
  
  // Bottom Bar
  copyrightText?: string;
  legalLinks?: LegalLink[];
  showLanguageSelector?: boolean;
  showThemeToggle?: boolean;
  
  // Scroll-to-Top
  showScrollTop?: boolean;
  scrollTopThreshold?: number;
  
  // Styling
  bgColor?: string;
  variant?: FooterVariant;
}

export interface FooterNavColumn {
  title: string;
  links: FooterNavLink[];
}

export interface FooterNavLink {
  label: string;
  url?: string;
  route?: string;
  iconName?: IconName;
  external?: boolean;
}

export interface ContactInfo {
  address?: string;
  city?: string;
  email?: string;
  phone?: string;
  showMap?: boolean;
  mapUrl?: string;
}

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  ariaLabel?: string;
  iconName?: IconName;
}

export type SocialPlatform = 
  | 'instagram' 
  | 'facebook' 
  | 'youtube' 
  | 'twitter' 
  | 'linkedin'
  | 'tiktok';

export interface LegalLink {
  label: string;
  route?: string;
  url?: string;
  external?: boolean;
}

export type FooterVariant =
  | 'wave'           // Wave-shaped top edge
  | 'curve'          // Asymmetric curve (like Header)
  | 'hills'          // Hills landscape
  | 'simple';        // Simple without shape

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_FOOTER_NAV: FooterNavColumn[] = [
  {
    title: 'Tanzmoment',
    links: [
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
        route: '/contact',
        iconName: 'mail',
      },
    ],
  },
];

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    platform: 'instagram',
    url: 'https://instagram.com/tanzmoment',
    ariaLabel: 'Folge uns auf Instagram',
  },
  {
    platform: 'facebook',
    url: 'https://facebook.com/tanzmoment',
    ariaLabel: 'Besuche uns auf Facebook',
  },
];

export const DEFAULT_LEGAL_LINKS: LegalLink[] = [
  {
    label: 'Impressum',
    route: '/legal/imprint',
  },
  {
    label: 'Datenschutz',
    route: '/legal/privacy',
  },
  {
    label: 'AGB',
    route: '/legal/terms',
  },
];

export const DEFAULT_CONTACT_INFO: ContactInfo = {
  address: 'Tanzstudio Musterstraße 12',
  city: '12345 Musterstadt',
  email: 'info@tanzmoment.de',
  phone: '+49 123 456789',
  showMap: false,
};

// ============================================================================
// SOCIAL PLATFORM ICON MAPPING
// ============================================================================

export const SOCIAL_ICON_PATHS: Record<SocialPlatform, string> = {
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
  
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  
  youtube: '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>',
  
  twitter: '<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>',
  
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  
  tiktok: '<path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>',
};