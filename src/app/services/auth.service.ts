// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import {
  Auth,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseAuthProfile
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  DocumentReference,
  docData,
  Timestamp
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { UserProfile } from '../models/user-profile'; // Győződj meg róla, hogy ez a fájl létezik és exportálja az interfészt

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);

  private currentUserSubject = new BehaviorSubject<FirebaseUser | null>(null);
  currentUser$: Observable<FirebaseUser | null> = this.currentUserSubject.asObservable();

  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  userProfile$: Observable<UserProfile | null> = this.userProfileSubject.asObservable();

  isLoggedIn$: Observable<boolean> = this.currentUser$.pipe(map(user => !!user));

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
      if (user) {
        this.loadUserProfile(user.uid).subscribe(profile => {
          this.userProfileSubject.next(profile || null);
        });
      } else {
        this.userProfileSubject.next(null);
      }
    });
  }

  async register(email: string, password: string, username: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      await updateFirebaseAuthProfile(user, { displayName: username });

      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        username: username,
        favoriteCurrency: 'EUR',
        selectedCurrencies: ['USD', 'HUF', 'GBP'],
        // registrationDate: Timestamp.now() // Opcionális
      };
      const userDocRef = doc(this.firestore, `userProfiles/${user.uid}`) as DocumentReference<UserProfile>;
      await setDoc(userDocRef, userProfile);

      this.userProfileSubject.next(userProfile);
      this.router.navigate(['/']);
      alert('Sikeres regisztráció!');
    } catch (error: any) {
      console.error("Regisztrációs hiba: ", error);
      alert(`Regisztráció sikertelen: ${this.formatFirebaseError(error)}`);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      // Az onAuthStateChanged kezeli a profil betöltését
      // const user = userCredential.user;
      // await this.updateLastLoginDate(user.uid); // Opcionális: utolsó bejelentkezés dátumának frissítése
      this.router.navigate(['/']);
      alert('Sikeres bejelentkezés!');
    } catch (error: any) {
      console.error("Bejelentkezési hiba: ", error);
      alert(`Bejelentkezés sikertelen: ${this.formatFirebaseError(error)}`);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
      alert('Sikeres kijelentkezés!');
    } catch (error: any) {
      console.error("Kijelentkezési hiba: ", error);
      alert(`Kijelentkezés sikertelen: ${error.message}`);
    }
  }

  private loadUserProfile(uid: string): Observable<UserProfile | null> {
    const userDocRef = doc(this.firestore, `userProfiles/${uid}`) as DocumentReference<UserProfile>;
    return docData<UserProfile>(userDocRef).pipe(
      map(profile => profile || null), // Ha nincs dokumentum, undefined helyett null-t adunk vissza
      tap(profile => {
        if (!profile) {
          console.warn(`Nem található profil a ${uid} UID-hoz.`);
        }
      })
    );
  }

  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    if (!uid) {
      alert('Hiba: Felhasználói azonosító hiányzik a profil frissítéséhez.');
      throw new Error('Felhasználói azonosító (UID) szükséges a profil frissítéséhez.');
    }
    const userDocRef = doc(this.firestore, `userProfiles/${uid}`);
    try {
      await setDoc(userDocRef, data, { merge: true });
      // Frissítjük a BehaviorSubject-et, hogy a UI azonnal reagáljon
      const currentProfile = this.userProfileSubject.value;
      if (currentProfile) {
        this.userProfileSubject.next({ ...currentProfile, ...data });
      } else {
        // Ha valamiért null volt, próbáljuk újra betölteni
        this.loadUserProfile(uid).subscribe(profile => this.userProfileSubject.next(profile || null));
      }
      alert('Profil sikeresen frissítve!');
    } catch (error: any) {
      console.error("Profil frissítési hiba: ", error);
      alert(`Profil frissítése sikertelen: ${error.message}`);
      throw error;
    }
  }

  // private async updateLastLoginDate(uid: string): Promise<void> {
  //   const userDocRef = doc(this.firestore, `userProfiles/${uid}`);
  //   try {
  //     await setDoc(userDocRef, { lastLoginDate: Timestamp.now() }, { merge: true });
  //   } catch (error) {
  //     console.error("Hiba az utolsó bejelentkezési dátum frissítésekor:", error);
  //   }
  // }

  private formatFirebaseError(error: any): string {
    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-email':
          return 'Érvénytelen email formátum.';
        case 'auth/user-disabled':
          return 'Ez a felhasználói fiók fel lett függesztve.';
        case 'auth/user-not-found':
        case 'auth/invalid-credential': // Újabb Firebase verziókban ez lehet a hibás jelszó/email
          return 'Hibás email cím vagy jelszó.';
        case 'auth/wrong-password': // Régebbi Firebase verziókban
          return 'Hibás jelszó.';
        case 'auth/email-already-in-use':
          return 'Ez az email cím már regisztrálva van.';
        case 'auth/weak-password':
          return 'A jelszó túl gyenge. Minimum 6 karakter szükséges.';
        default:
          return error.message || 'Ismeretlen authentikációs hiba történt.';
      }
    }
    return error.message || 'Ismeretlen hiba történt.';
  }
}
