// ============================================================================
// CONTACT INFO TYPES
// ============================================================================

export interface ContactInfo {
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  phone: string;
  email: string;
  openingHours: OpeningHoursEntry[];
}

export interface OpeningHoursEntry {
  days: string;
  hours: string;
}
