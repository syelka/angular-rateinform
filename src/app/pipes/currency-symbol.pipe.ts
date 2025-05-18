// src/app/pipes/currency-symbol.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencySymbol',
  standalone: true
})
export class CurrencySymbolPipe implements PipeTransform {
  private symbols: { [key: string]: string } = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    JPY: '¥',
    HUF: 'Ft',
    CHF: 'CHF',
    CAD: 'C$',
    AUD: 'A$',
    CNY: '¥',
    INR: '₹',
    KRW: '₩'
    // ...többi deviza, amit használsz
  };

  transform(currencyCode: string | undefined | null): string {
    if (!currencyCode) {
      return '';
    }
    const upperCode = currencyCode.toUpperCase();
    return this.symbols[upperCode] || upperCode; // Ha nincs szimbólum, a kódot adja vissza
  }
}
