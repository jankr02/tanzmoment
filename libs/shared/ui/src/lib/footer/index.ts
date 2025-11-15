// ============================================================================
// FOOTER COMPONENT - PUBLIC API
// ============================================================================

/**
 * Public API for Footer Component
 *
 * Usage:
 * import { FooterComponent, FooterConfig } from '@/shared/ui/footer';
 */

export { FooterComponent } from './footer.component';
export type {
  FooterConfig,
  FooterNavColumn,
  FooterNavLink,
  ContactInfo,
  SocialLink,
  SocialPlatform,
  LegalLink,
  FooterVariant,
} from './footer.types';
export {
  DEFAULT_FOOTER_NAV,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_LEGAL_LINKS,
  DEFAULT_CONTACT_INFO,
} from './footer.types';