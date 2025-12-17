// ============================================================================
// CONTACT DIRECTIONS TYPES
// ============================================================================

export interface DirectionsInfo {
  parking: ParkingInfo;
  publicTransport: PublicTransportInfo;
  accessibility: AccessibilityInfo;
  additionalInfo?: string;
}

export interface ParkingInfo {
  available: boolean;
  description: string;
  details?: string[];
}

export interface PublicTransportInfo {
  description: string;
  connections: TransportConnection[];
}

export interface TransportConnection {
  type: 'bus' | 'train' | 'tram';
  line: string;
  stop: string;
  walkingTime?: string;
}

export interface AccessibilityInfo {
  wheelchairAccessible: boolean;
  description: string;
  features?: string[];
}
