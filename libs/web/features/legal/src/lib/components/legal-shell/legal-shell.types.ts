export type LegalPageKey = 'imprint' | 'privacy' | 'terms';

export interface LegalNavItem {
  key: LegalPageKey;
  label: string;
  route: string;
}

export const LEGAL_NAV_ITEMS: ReadonlyArray<LegalNavItem> = [
  { key: 'imprint', label: 'Impressum', route: '/impressum' },
  { key: 'privacy', label: 'Datenschutz', route: '/datenschutz' },
  { key: 'terms', label: 'AGB', route: '/agb' },
];
