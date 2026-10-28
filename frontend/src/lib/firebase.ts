import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  connectAuthEmulator,
  type Auth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if actual credentials were provided in .env
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your_api_key_here'
);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
const googleProvider = new GoogleAuthProvider();

// Custom parameters for Google OAuth popup
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);

  // Optional connection to local Firebase Auth Emulator
  if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.info('[Firebase] Connected to local Auth Emulator at http://localhost:9099');
  }
} else {
  console.info(
    '[Firebase] Real credentials not detected in .env. Running in Mock/Dev mode with simulated auth.'
  );
}

export { app, auth, googleProvider };
