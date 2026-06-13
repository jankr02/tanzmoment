export interface CtaButton {
  text: string;
  variant: 'primary' | 'secondary';
  route?: string;
  externalLink?: string;
}

export interface CtaSectionData {
  headline: string;
  subheadline: string;
  buttons: CtaButton[];
}
