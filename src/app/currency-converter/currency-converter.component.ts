// src/app/currency-converter/currency-converter.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // JAVÍTVA: Helyes modul importálása
import { MatIconModule } from '@angular/material/icon'; // Hozzáadva a swap ikonhoz

import { Subscription, of } from 'rxjs';
import { map, take, tap, filter } from 'rxjs/operators'; // filter importálva

import { Currency } from '../data/currencies';
import { AuthService } from '../services/auth.service'; // Ellenőrizd az elérési utat!
import { CurrencyDataService, ExchangeRate } from '../services/currency-data.service';
import { UserProfile } from '../models/user-profile'; // Ellenőrizd az elérési utat!
import { CurrencySymbolPipe } from '../pipes/currency-symbol.pipe'; // Importáljuk a pipe-ot

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule, // JAVÍTVA: Helyes modulnév
    MatIconModule,            // Hozzáadva
    DecimalPipe,
    NgIf,
    NgForOf,
    CurrencySymbolPipe      // Hozzáadva a pipe
  ],
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.scss']
})
export class CurrencyConverterComponent implements OnInit, OnDestroy {
  amount: number = 1;
  fromCurrencyCode: string = 'EUR';
  toCurrencyCode: string = 'USD';
  convertedAmount: number | null = null;
  availableCurrencies: Currency[] = [];
  isLoadingCurrencies = true;
  isLoadingConversion = false;

  private authService: AuthService = inject(AuthService);
  private currencyDataService: CurrencyDataService = inject(CurrencyDataService);
  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this.loadAvailableCurrencies();

    this.subscriptions.add(
      // JAVÍTVA: Explicit típus a 'profile' paraméternek
      this.authService.userProfile$.subscribe((profile: UserProfile | null) => {
        if (profile && profile.favoriteCurrency) {
          if (this.availableCurrencies.some(c => c.name === profile.favoriteCurrency)) {
            this.toCurrencyCode = profile.favoriteCurrency;
          }
        }
        if (this.availableCurrencies.length > 0 && !this.isLoadingConversion) { // Csak akkor konvertálunk, ha nem fut már
          this.convert();
        }
      })
    );
  }

  private loadAvailableCurrencies(): void {
    this.isLoadingCurrencies = true;
    this.subscriptions.add(
      this.currencyDataService.getAvailableCurrencies().subscribe({
        next: (currencies: Currency[]) => { // JAVÍTVA: Explicit típus
          this.availableCurrencies = currencies;
          if (this.availableCurrencies.length > 0) {
            if (!this.availableCurrencies.some(c => c.name === this.fromCurrencyCode)) {
              this.fromCurrencyCode = this.availableCurrencies[0].name;
            }
            if (!this.availableCurrencies.some(c => c.name === this.toCurrencyCode)) {
              this.toCurrencyCode = this.availableCurrencies.length > 1 ? this.availableCurrencies[1].name : this.availableCurrencies[0].name;
            }
            this.convert();
          }
          this.isLoadingCurrencies = false;
        },
        error: (err: any) => { // JAVÍTVA: Explicit típus
          console.error("Hiba a devizák betöltésekor:", err);
          this.isLoadingCurrencies = false;
        }
      })
    );
  }

  async convert(): Promise<void> {
    if (!this.fromCurrencyCode || !this.toCurrencyCode || this.amount == null || this.availableCurrencies.length === 0) {
      this.convertedAmount = null;
      return;
    }

    this.isLoadingConversion = true;
    this.convertedAmount = null;

    // A valós árfolyam lekérését a CurrencyDataService-ből kellene megvalósítani
    // Ez a rész továbbra is a DUMMY implementációt használja
    const sourceCurrency = this.availableCurrencies.find(c => c.name === this.fromCurrencyCode);
    const targetCurrency = this.availableCurrencies.find(c => c.name === this.toCurrencyCode);

    if (sourceCurrency && targetCurrency && sourceCurrency.price != null && targetCurrency.price != null) {
      this.convertedAmount = this.amount * (targetCurrency.price / sourceCurrency.price);
    } else {
      this.convertedAmount = null;
      console.warn('Hiányzó árfolyamadat a konverzióhoz a dummy kalkulációban.');
    }
    this.isLoadingConversion = false;
  }

  swapCurrencies(): void {
    const temp = this.fromCurrencyCode;
    this.fromCurrencyCode = this.toCurrencyCode;
    this.toCurrencyCode = temp;
    this.convert();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
