// src/app/services/currency-data.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, query, where, orderBy, limit, Timestamp, getDocs, setDoc, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Currency } from '../data/currencies'; // A meglévő fix adatstruktúra

// Új modellek az árfolyamokhoz és historikus adatokhoz
export interface ExchangeRate {
  id?: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  lastUpdated: Timestamp;
}

export interface HistoricalRate {
  id?: string;
  pair: string; // pl. 'EURUSD'
  date: Timestamp;
  rate: number;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyDataService {
  private firestore: Firestore = inject(Firestore);

  // Ezt a fix listát használjuk fallback-ként vagy kezdeti feltöltéshez
  private fallbackCurrencies: Currency[] = [
    { name: 'Euro', symbol: '€', price: 1, code: 'EUR' },
    { name: 'US Dollar', symbol: '$', price: 1.1, code: 'USD' },
    { name: 'British Pound', symbol: '£', price: 0.85, code: 'GBP' },
    { name: 'Japanese Yen', symbol: '¥', price: 130, code: 'JPY' },
    { name: 'Hungarian Forint', symbol: 'Ft', price: 375, code: 'HUF' },
    // ...többi deviza
  ];

  constructor() {
    // Kezdeti adatok feltöltése, ha szükséges (csak fejlesztéshez)
    // this.seedInitialCurrenciesIfEmpty();
  }

  getAvailableCurrencies(): Observable<Currency[]> {
    const currenciesColRef = collection(this.firestore, 'availableCurrencies');
    return (collectionData(currenciesColRef, { idField: 'code' }) as Observable<Currency[]>).pipe(
      catchError(err => {
        console.error("Hiba a Firestore devizák lekérésekor, fallback használata:", err);
        return of(this.fallbackCurrencies); // Hiba esetén a fallback listát adjuk vissza
      }),
      map(currencies => currencies.length > 0 ? currencies : this.fallbackCurrencies) // Ha üres a Firestore, fallback
    );
  }

  // Példa: EUR alapú árfolyamok lekérése (ezt majd egy API-ból kellene frissíteni)
  getExchangeRatesForBase(baseCurrencyCode: string = 'EUR'): Observable<ExchangeRate[]> {
    const ratesColRef = collection(this.firestore, 'exchangeRates');
    const q = query(ratesColRef, where('baseCurrency', '==', baseCurrencyCode), orderBy('lastUpdated', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<ExchangeRate[]>;
  }

  getExchangeRate(fromCurrencyCode: string, toCurrencyCode: string): Observable<ExchangeRate | undefined> {
    const ratesColRef = collection(this.firestore, 'exchangeRates');
    const q = query(ratesColRef,
      where('baseCurrency', '==', fromCurrencyCode),
      where('targetCurrency', '==', toCurrencyCode),
      orderBy('lastUpdated', 'desc'), // Legfrissebb árfolyam
      limit(1));
    return collectionData(q, { idField: 'id' }).pipe(
      map(rates => rates.length > 0 ? rates[0] as ExchangeRate : undefined),
      catchError(err => {
        console.error(`Hiba az árfolyam lekérésekor (${fromCurrencyCode} -> ${toCurrencyCode}):`, err);
        return of(undefined);
      })
    );
  }

  // --- Kezdeti adatok feltöltése (csak fejlesztéshez) ---
  async seedInitialCurrenciesIfEmpty(): Promise<void> {
    const currenciesColRef = collection(this.firestore, 'availableCurrencies');
    const snapshot = await getDocs(query(currenciesColRef, limit(1)));

    if (snapshot.empty) {
      console.log("Alap deviza adatok feltöltése Firestore 'availableCurrencies' kollekcióba...");
      for (const currency of this.fallbackCurrencies) {
        if (currency.code) { // Csak akkor, ha van 'code'
          const docRef = doc(this.firestore, `availableCurrencies/${currency.code}`);
          try {
            await setDoc(docRef, {
              name: currency.name,
              symbol: currency.symbol,
              // A 'price' itt az EUR-hoz viszonyított árfolyamot jelentheti,
              // de a valós árfolyamokat az 'exchangeRates' kollekcióban kellene tárolni.
              // Most a példa kedvéért ezt is elmentjük.
              priceRelativeToEUR: currency.price
            });
          } catch (e) {
            console.error(`Hiba a ${currency.code} deviza mentésekor: `, e);
          }
        }
      }
      console.log("Alap deviza adatok feltöltve.");

      // Példa árfolyamok feltöltése (EUR alapon)
      // Ezt egy valós API hívásnak kellene helyettesítenie!
      const ratesColRef = collection(this.firestore, 'exchangeRates');
      const eurRates = [
        { baseCurrency: 'EUR', targetCurrency: 'USD', rate: 1.08, lastUpdated: Timestamp.now() },
        { baseCurrency: 'EUR', targetCurrency: 'HUF', rate: 390.50, lastUpdated: Timestamp.now() },
        { baseCurrency: 'EUR', targetCurrency: 'GBP', rate: 0.85, lastUpdated: Timestamp.now() },
      ];
      for (const rate of eurRates) {
        try {
          await addDoc(ratesColRef, rate);
        } catch (e) {
          console.error("Hiba árfolyam mentésekor: ", e);
        }
      }
      console.log("Példa EUR alapú árfolyamok feltöltve.");
    }
  }
}
