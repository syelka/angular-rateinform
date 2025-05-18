// src/app/data/currencies.ts
export interface Currency {
  code?: string; // Hozzáadva: Deviza kódja (pl. 'EUR', 'USD') - Firestore ID-ként is használható
  name: string;
  symbol: string;
  price: number; // Ez az 1 EUR-hoz viszonyított árfolyamot jelentette az eredeti kódban
                 // Firestore-ban érdemes lehet ezt 'priceRelativeToEUR'-nak nevezni,
                 // és külön 'exchangeRates' kollekciót használni a valós árfolyamokhoz.
}

// Az export const currencies: Currency[] = [...] részt ki is veheted innen,
// ha a CurrencyDataService.fallbackCurrencies vagy a Firestore lesz a fő adatforrás.
// Vagy meghagyhatod, de a 'code' mezőt add hozzá minden elemhez.
export const currencies: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', price: 1 },
  { code: 'USD', name: 'US Dollar', symbol: '$', price: 1.1 },
  { code: 'GBP', name: 'British Pound', symbol: '£', price: 0.85 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', price: 130 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', price: 1.05 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', price: 1.45 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', price: 1.6 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', price: 7.5 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', price: 90 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', price: 1400 },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', price: 375 },
];
