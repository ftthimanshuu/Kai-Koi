import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import { apiClient, setAuthTokenProvider } from '@/lib/api-client';
import type { AuthUser, BackendUserSyncResponse, UserRole } from '@/types/auth';

interface AuthState {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initAuth: () => () => void;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loginAsMockRole: (role: UserRole) => Promise<void>;
  clearError: () => void;
  syncUserWithBackend: (fbUser: FirebaseUser) => Promise<AuthUser>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  role: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  clearError: () => set({ error: null }),

  /**
   * Syncs the authenticated Firebase user with our database backend via POST /api/v1/me/sync
   * (SPECIFICATION.md §5.1 FR-AUTH-7 & §10.1)
   */
  syncUserWithBackend: async (fbUser: FirebaseUser): Promise<AuthUser> => {
    try {
      const response = await apiClient.post<BackendUserSyncResponse>('/me/sync');
      const syncedUser: AuthUser = {
        id: response.data.id,
        firebaseUid: fbUser.uid,
        email: fbUser.email || response.data.email,
        fullName: fbUser.displayName || response.data.fullName || 'Kai Koi Member',
        phone: response.data.phone,
        role: response.data.role,
        emailVerified: fbUser.emailVerified || response.data.emailVerified,
        enabled: response.data.enabled,
      };

      set({
        user: syncedUser,
        role: syncedUser.role,
        isLoading: false,
      });

      return syncedUser;
    } catch (err: unknown) {
      console.error('Failed to sync user with backend:', err);
      // Fallback local representation if backend is unavailable
      const fallbackUser: AuthUser = {
        id: `local_${fbUser.uid}`,
        firebaseUid: fbUser.uid,
        email: fbUser.email || '',
        fullName: fbUser.displayName || 'Kai Koi Member',
        role: 'CUSTOMER',
        emailVerified: fbUser.emailVerified,
        enabled: true,
      };

      set({
        user: fallbackUser,
        role: 'CUSTOMER',
        isLoading: false,
      });

      return fallbackUser;
    }
  },

  /**
   * Initializes the Auth listener and plugs the token provider into Axios.
   * Returns an unsubscribe function.
   */
  initAuth: () => {
    // 1. Wire the token provider so Axios automatically attaches Bearer tokens
    setAuthTokenProvider(async () => {
      const current = get();
      if (isFirebaseConfigured && auth?.currentUser) {
        return auth.currentUser.getIdToken();
      }
      // In mock mode, return a dummy mock JWT
      if (current.user) {
        return `mock_token_role_${current.role}`;
      }
      return null;
    });

    // 2. If real Firebase is configured, listen to onAuthStateChanged
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          set({ firebaseUser: fbUser, isLoading: true });
          await get().syncUserWithBackend(fbUser);
          set({ isInitialized: true, isLoading: false });
        } else {
          set({
            user: null,
            firebaseUser: null,
            role: null,
            isInitialized: true,
            isLoading: false,
          });
        }
      });

      return unsubscribe;
    }

    // 3. Fallback dev mode (Firebase keys not provided yet)
    set({ isInitialized: true, isLoading: false });
    return () => {};
  },

  signInWithEmail: async (email: string, pass: string) => {
    set({ isLoading: true, error: null });
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        await get().syncUserWithBackend(cred.user);
      } else {
        // Dev Mock Fallback
        await new Promise((res) => setTimeout(res, 500));
        const mockUser: AuthUser = {
          id: 'usr_mock_customer',
          firebaseUid: 'fb_mock_uid',
          email,
          fullName: email.split('@')[0],
          role: 'CUSTOMER',
          emailVerified: true,
          enabled: true,
        };
        set({ user: mockUser, role: 'CUSTOMER', isLoading: false });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await signInWithPopup(auth, googleProvider);
        await get().syncUserWithBackend(cred.user);
      } else {
        // Dev Mock Fallback
        await new Promise((res) => setTimeout(res, 500));
        const mockUser: AuthUser = {
          id: 'usr_mock_google',
          firebaseUid: 'fb_google_uid',
          email: 'google.guest@example.com',
          fullName: 'Google Guest',
          role: 'CUSTOMER',
          emailVerified: true,
          enabled: true,
        };
        set({ user: mockUser, role: 'CUSTOMER', isLoading: false });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign in failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      if (isFirebaseConfigured && auth) {
        await firebaseSignOut(auth);
      }
      set({
        user: null,
        firebaseUser: null,
        role: null,
        isLoading: false,
      });
    } catch (err) {
      console.error('Sign out failed', err);
      set({ isLoading: false });
    }
  },

  /**
   * Fast Development Helper:
   * Instantly sign in as CUSTOMER, STAFF, or ADMIN to test role-gated pages.
   */
  loginAsMockRole: async (role: UserRole) => {
    set({ isLoading: true, error: null });
    await new Promise((res) => setTimeout(res, 300));

    const mockUser: AuthUser = {
      id: `usr_mock_${role.toLowerCase()}`,
      firebaseUid: `fb_mock_${role.toLowerCase()}_uid`,
      email: `${role.toLowerCase()}@kaikoi.com`,
      fullName: `Kai Koi ${role}`,
      role,
      emailVerified: true,
      enabled: true,
    };

    set({
      user: mockUser,
      role,
      isLoading: false,
    });
  },
}));
