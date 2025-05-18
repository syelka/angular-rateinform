// src/app/home/home.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription, combineLatest, of } from 'rxjs';
import { map, switchMap, tap, filter, catchError } from 'rxjs/operators'; // filter és catchError importálva
import { RouterLink } from '@angular/router'; // RouterLink import

import { AuthService } from '../services/auth.service'; // Ellenőrizd az elérési utat!
import { UserProfile } from '../models/user-profile';   // Ellenőrizd az elérési utat!
import { CurrencyDataService, ExchangeRate } from '../services/currency-data.service';
import { Currency } from '../data/currencies';
import { CurrencySymbolPipe } from '../pipes/currency-symbol.pipe'; // Importáljuk a pipe-ot

interface DisplayRate {
  targetCurrencyName: string;
  targetCurrencySymbol: string;
  rate?: number;
  favoriteCurrencySymbol: string;
  isLoading: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    NgIf,
    NgForOf,
    MatCardModule,
    MatProgressSpinnerModule,
    CurrencySymbolPipe, // Hozzáadva a pipe
    RouterLink          // Hozzáadva
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  userProfile: UserProfile | null = null;
  displayedRates: DisplayRate[] = [];
  isLoadingRates = true;
  allAvailableCurrencies: Currency[] = [];

  private authService: AuthService = inject(AuthService);
  private currencyDataService: CurrencyDataService = inject(CurrencyDataService);
  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.currencyDataService.getAvailableCurrencies().subscribe((currencies: Currency[]) => { // JAVÍTVA: Explicit típus
        this.allAvailableCurrencies = currencies;
        this.loadUserAndRates();
      })
    );
  }

  private loadUserAndRates(): void {
    this.subscriptions.add(
      // JAVÍTVA: Explicit típus
      this.authService.isLoggedIn$.subscribe((loggedIn: boolean) => {
        this.isLoggedIn = loggedIn;
        if (!loggedIn) {
          this.isLoadingRates = false;
          this.displayedRates = [];
        }
      })
    );

    this.subscriptions.add(
      this.authService.userProfile$.pipe(
        tap((profile: UserProfile | null) => { // JAVÍTVA: Explicit típus
          this.userProfile = profile;
          if (!profile || !this.isLoggedIn) {
            this.isLoadingRates = false;
            this.displayedRates = [];
          }
        }),
        // JAVÍTVA: filter operátor helyes használata
        filter((profile): profile is UserProfile => profile !== null && this.isLoggedIn),
        switchMap((profile: UserProfile) => { // JAVÍTVA: Explicit típus
          this.isLoadingRates = true;
          const favoriteCurrencyCode = profile.favoriteCurrency;
          const selectedCurrencyCodes = profile.selectedCurrencies || [];

          if (!favoriteCurrencyCode || selectedCurrencyCodes.length === 0) {
            this.isLoadingRates = false;
            return of([]);
          }

          const favoriteCurrencyDetails = this.allAvailableCurrencies.find(c => c.name === favoriteCurrencyCode);
          const favoriteSymbol = favoriteCurrencyDetails?.symbol || favoriteCurrencyCode!; // Non-null assertion, mivel ellenőriztük

          const rateObservables = selectedCurrencyCodes.map((targetCode: string) => { // JAVÍTVA: Explicit típus
            const targetCurrencyDetails = this.allAvailableCurrencies.find(c => c.name === targetCode);
            const initialDisplayRate: DisplayRate = {
              targetCurrencyName: targetCurrencyDetails?.name || targetCode,
              targetCurrencySymbol: targetCurrencyDetails?.symbol || targetCode,
              favoriteCurrencySymbol: favoriteSymbol,
              isLoading: true
            };

            if (targetCode === favoriteCurrencyCode) {
              return of({ ...initialDisplayRate, rate: 1, isLoading: false });
            }

            // DUMMY implementáció
            return of(this.calculateDummyRate(favoriteCurrencyCode!, targetCode)).pipe( // Non-null assertion
              map(calculatedRate => ({
                ...initialDisplayRate,
                rate: calculatedRate,
                isLoading: false
              })),
              catchError(() => of({ ...initialDisplayRate, rate: undefined, isLoading: false }))
            );
          });
          return combineLatest(rateObservables);
        })
      ).subscribe((rates: DisplayRate[]) => { // JAVÍTVA: Explicit típus
        this.displayedRates = rates;
        this.isLoadingRates = false;
      })
    );
  }

  private calculateDummyRate(baseCurrencyName: string, targetCurrencyName: string): number | undefined {
    const base = this.allAvailableCurrencies.find(c => c.name === baseCurrencyName);
    const target = this.allAvailableCurrencies.find(c => c.name === targetCurrencyName);

    if (base && target && base.price != null && target.price != null) {
      return (target.price / base.price);
    }
    return undefined;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
