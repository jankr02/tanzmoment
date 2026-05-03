export interface SeoMetadata {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
}

export const SEO_DEFAULTS = {
  siteUrl: 'https://tanzmoment.de',
  siteName: 'Tanzmoment',
  defaultTitle: 'Tanzmoment — Tanzstudio in Mössingen',
  titleSuffix: ' | Tanzmoment',
  defaultDescription:
    'Inklusives Tanzstudio in Mössingen. Kurse für Mütter, Kinder, Ausdruckstanz und barrierefreier Tanz für Menschen mit Behinderung.',
  defaultImage: '/assets/images/og-default.jpg',
  locale: 'de_DE',
} as const;
