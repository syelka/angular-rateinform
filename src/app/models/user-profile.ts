// src/app/models/user-profile.ts
export interface UserProfile { // <-- Az 'export' kulcsszó fontos!
  uid: string;
  email: string;
  username: string;
  favoriteCurrency?: string;
  selectedCurrencies?: string[];
}
