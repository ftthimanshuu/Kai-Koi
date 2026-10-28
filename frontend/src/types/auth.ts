/**
 * Role hierarchy for Kai Koi users (SPECIFICATION.md §4)
 * - GUEST: Not logged in (read-only browsing)
 * - CUSTOMER: Holds units, books sessions, views & cancels own bookings
 * - STAFF: Front-desk check-in, QR verification
 * - ADMIN: Manages venues, layouts, movies/shows, sessions, users, refunds
 */
export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface AuthUser {
  id: string; // Database app_user ID (UUID)
  firebaseUid: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  emailVerified: boolean;
  enabled: boolean;
}

export interface BackendUserSyncResponse {
  id: string;
  firebaseUid: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  emailVerified: boolean;
  enabled: boolean;
  hasAuthToken?: boolean;
}
