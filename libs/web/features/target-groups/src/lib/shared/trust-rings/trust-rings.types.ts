export type TrustGroup = 'kids' | 'ausdruck' | 'muetter' | 'behinderung';

export interface TrustLayer {
  title: string;
  description: string;
}

export interface TrustGroupTheme {
  /** Colour ramp, inner (darkest) → outer (lightest). */
  ramp: [string, string, string, string];
  /** Light tint for the safety band. */
  tint: string;
  heading: string;
  sub: string;
  layers: TrustLayer[];
}
