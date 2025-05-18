import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Töltésjelzőhöz
import { CommonModule, NgForOf } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { UserProfile } from '../models/user-profile';
import { currencies, Currency } from '../data/currencies'; // Meglévő deviza adatok

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    NgForOf
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  isLoading = true; // Kezdetben töltjük az adatokat
  availableCurrencies: Currency[] = currencies; // A fix listából

  private authService: AuthService = inject(AuthService);
  private fb: FormBuilder = inject(FormBuilder);
  private userProfileSubscription: Subscription | undefined;
  private currentUserUid: string | null = null;

  constructor() {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }, Validators.required], // Felhasználónév nem módosítható itt
      email: [{ value: '', disabled: true }, Validators.required], // Email nem módosítható itt
      favoriteCurrency: [''],
      selectedCurrencies: [[]]
      // Jelszó módosítást külön komponensben/dialógusban érdemesebb kezelni
      // newPassword: [''],
      // confirmPassword: ['']
    });
  }

  ngOnInit(): void {
    this.userProfileSubscription = this.authService.userProfile$.pipe(
      filter((profile): profile is UserProfile => profile !== null) // Csak akkor dolgozzuk fel, ha nem null
    ).subscribe(profile => {
      if (profile) {
        this.currentUserUid = profile.uid;
        this.profileForm.patchValue({
          username: profile.username,
          email: profile.email,
          favoriteCurrency: profile.favoriteCurrency || '',
          selectedCurrencies: profile.selectedCurrencies || []
        });
        this.isLoading = false;
      } else {
        // Ha valamilyen okból nincs profil, bár a felhasználó be van jelentkezve
        // (ez nem fordulhatna elő az AuthService logikája szerint)
        this.isLoading = false;
        console.error("Profiladatok nem érhetők el, bár a felhasználó be van jelentkezve.");
      }
    });

    // Ha a currentUser$ Observable-t használjuk a UID megszerzésére:
    // this.authService.currentUser$.pipe(take(1)).subscribe(user => {
    //   if (user) {
    //     this.currentUserUid = user.uid;
    //     // Itt is betölthetnénk a profilt, ha az userProfile$ nem lenne elég
    //   }
    // });
  }

  async onSave(): Promise<void> {
    if (this.profileForm.invalid || !this.currentUserUid) {
      alert('Kérjük, töltse ki helyesen az űrlapot.');
      return;
    }

    this.isLoading = true;
    const formData = this.profileForm.getRawValue(); // getRawValue() a disabled mezőkhöz is

    const profileUpdateData: Partial<UserProfile> = {
      // A username és email itt nem módosítandó, de ha mégis, akkor itt kellene kezelni
      favoriteCurrency: formData.favoriteCurrency,
      selectedCurrencies: formData.selectedCurrencies
    };

    try {
      await this.authService.updateUserProfile(this.currentUserUid, profileUpdateData);
      // Az AuthService már ad alertet a sikeres frissítésről
    } catch (error) {
      console.error("Profil mentési hiba:", error);
      // Az AuthService már ad alertet a hibáról
    } finally {
      this.isLoading = false;
    }
  }

  async onLogout(): Promise<void> {
    this.isLoading = true;
    await this.authService.logout();
    // A navigációt és az alertet az AuthService kezeli
    this.isLoading = false;
  }

  ngOnDestroy(): void {
    if (this.userProfileSubscription) {
      this.userProfileSubscription.unsubscribe();
    }
  }
}
