export interface MethodologyStation {
  /** e.g. "01 — Der Anfang" */
  indexLabel: string;
  title: string;
  /** Body copy, may contain <strong>/<em> markup. */
  body: string;
}

export interface MethodologyData {
  kicker: string;
  /** Headline, may contain an <em> emphasis span. */
  headline: string;
  lede: string;
  stations: MethodologyStation[];
}
