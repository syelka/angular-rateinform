import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "rateinform-28ccb", appId: "1:225084108173:web:94994180ec10d690d961c4", storageBucket: "rateinform-28ccb.firebasestorage.app", apiKey: "AIzaSyDyVbv9bKSFm6j0tRwyID4_un-Eh3IgvCY", authDomain: "rateinform-28ccb.firebaseapp.com", messagingSenderId: "225084108173", measurementId: "G-0E415PDQQJ" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
