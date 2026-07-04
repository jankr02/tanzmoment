import { UserRole } from '@prisma/client';

/**
 * Validated user record shared between the auth service (login/register) and the
 * refresh-token service (rotation) as the input for minting a session. Mirrors
 * the columns selected in both places.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
}
