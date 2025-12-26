'use server';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore as getFirestoreAdmin, Firestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from '../../firebase-admin-key.json';

let adminApp: App;

function getAdminApp(): App {
    if (getApps().length > 0) {
        const app = getApps().find(app => app.name === '[DEFAULT]');
        if (app) return app;
    }

    try {
        adminApp = initializeApp({
            credential: cert(serviceAccount),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
        console.log('Firebase Admin SDK initialized.');
        return adminApp;
    } catch (error: any) {
        console.error("Firebase Admin initialization error:", error);
        if (error.code === 'app/duplicate-app') {
            const app = getApps().find(app => app.name === '[DEFAULT]');
            if (app) return app;
        }
        throw new Error('Could not initialize Firebase Admin SDK. ' + error.message);
    }
}

export async function getFirestore(): Promise<Firestore> {
    const app = getAdminApp();
    return getFirestoreAdmin(app);
}

export async function getAuthAdmin() {
    const app = getAdminApp();
    return getAuth(app);
}
