// Firebase client initialization and exports
// Reads config from public env vars so it can run on the client

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
};

// Basic runtime validation to surface misconfiguration early
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missingKeys.length) {
  // eslint-disable-next-line no-console
  console.warn(
    `Firebase configuration missing keys: ${missingKeys.join(', ')}. ` +
      'Ensure NEXT_PUBLIC_FIREBASE_* vars are set in .env.local and restart the dev server.'
  );
}

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.log('[Firebase] Using config:', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.slice(0, 6)}…` : '(empty)',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
  });
}

if (!firebaseConfig.apiKey || firebaseConfig.apiKey.length < 30) {
  throw new Error(
    'Firebase: Invalid or missing API key. Verify NEXT_PUBLIC_FIREBASE_API_KEY in .env.local matches the Web App config.'
  );
}

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;


