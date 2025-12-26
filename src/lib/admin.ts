import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App | undefined;

export async function getAdminApp(): Promise<App> {
  if (adminApp) return adminApp;

  try {
    // Check for existing app
    const existing = getApps().find(app => app.name === 'admin');
    if (existing) {
      adminApp = existing;
      return adminApp;
    }

    console.log('🔄 Initializing Firebase Admin SDK...');
    
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error('Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable');
    }

    // Try service account from environment variable
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountJson) {
      try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        console.log('✅ Using service account credentials');
        
        adminApp = initializeApp({
          credential: cert(serviceAccount),
          projectId,
        }, 'admin');
        
        return adminApp;
      } catch (parseError) {
        console.error('❌ Failed to parse service account:', parseError);
      }
    }

    // Try Application Default Credentials
    console.log('ℹ️ No service account, trying Application Default Credentials...');
    
    // For local development, you can set GOOGLE_APPLICATION_CREDENTIALS
    // or run: gcloud auth application-default login
    adminApp = initializeApp({
      projectId,
    }, 'admin');
    
    console.log('✅ Firebase Admin initialized with default credentials');
    return adminApp;

  } catch (error: any) {
    console.error('❌ Firebase Admin initialization failed:', error);
    
    // Provide helpful error message
    if (error.message.includes('credentials')) {
      throw new Error(
        'Firebase Admin SDK failed to initialize. Please set FIREBASE_SERVICE_ACCOUNT environment variable.\n' +
        '1. Go to Firebase Console → Project Settings → Service Accounts\n' +
        '2. Click "Generate New Private Key"\n' +
        '3. Copy the JSON and set as FIREBASE_SERVICE_ACCOUNT in .env.local'
      );
    }
    
    throw error;
  }
}

export async function getFirestoreAdmin(): Promise<Firestore> {
  const app = await getAdminApp();
  return getFirestore(app);
}

export async function getAuthAdmin() {
  const app = await getAdminApp();
  return getAuth(app);
}