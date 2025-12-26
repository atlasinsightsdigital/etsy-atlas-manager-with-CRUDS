'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  // Hardcoded config to ensure it's always available.
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
  };

  if (getApps().length) {
    return getSdks(getApp());
  }

  // Always initialize from the firebaseConfig object to ensure consistency.
  const firebaseApp = initializeApp(firebaseConfig);
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

// Export hooks - ONLY export what exists
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './provider';

// Export providers
export { FirebaseClientProvider } from './client-provider';

// Export utilities
export { FirestorePermissionError } from './errors';
export { errorEmitter } from './error-emitter';

// Helper function to get firestore
export function getFirestoreInstance() {
  const { firestore } = initializeFirebase();
  return firestore;
}

// Helper function to get auth
export function getAuthInstance() {
  const { auth } = initializeFirebase();
  return auth;
}
