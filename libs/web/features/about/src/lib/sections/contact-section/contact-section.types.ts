/**
 * Data structure for the Contact Section
 */
export interface ContactSectionData {
  /** Section headline */
  headline: string;

  /** Short introduction */
  subheadline?: string;

  /** Address */
  address: {
    street: string;
    city: string;
    postalCode: string;
  };

  /** Email */
  email: string;

  /** Phone (optional) */
  phone?: string;

  /** CTA Button Text */
  ctaText: string;

  /** CTA Button Link (mailto: oder Route) */
  ctaLink: string;
}
